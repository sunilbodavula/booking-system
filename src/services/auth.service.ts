import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { createUser, findUserByEmail, findUserById } from '../repository/user.repository';
import * as tokenRepo from '../repository/refreshToken.repository';
import { PublicUser, TokenPair, User } from '../types';
import { LoginInput, RegisterInput } from '../validation/schema';
import { HttpError } from '../utils/HttpError';
import { generateRefreshToken, hashToken, signAccessToken } from '../utils/token';
import { Queryable, withTransaction } from '../db/transaction';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.bcryptCost);

const toPublicUser = (user: User): PublicUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
});

const issueTokens = async (user: User, db?: Queryable): Promise<TokenPair> => {
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
    await tokenRepo.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt, db);

    return {
        accessToken: signAccessToken(user),
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: env.accessTokenTtlSeconds,
    };
};

export const register = async (input: RegisterInput): Promise<{user: PublicUser} & TokenPair> => {
    if(await findUserByEmail(input.email)){
        throw new HttpError(409, 'Email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.bcryptCost);

    const { user, tokens } = await withTransaction(async (client) => {
        const created = await createUser(input.name, input.email, passwordHash, client);
        const issued = await issueTokens(created, client);
        return {user: created, tokens: issued}
    })

    return {user: toPublicUser(user), ...tokens};
};

export const login = async (input: LoginInput): Promise<{user: PublicUser} & TokenPair> => {
    const user = await findUserByEmail(input.email);

    const passwordOk = await bcrypt.compare(input.password, user ? user.password : DUMMY_HASH);

    if(!user || !passwordOk){
        throw new HttpError(401, 'Invalid email or password');
    }

    return { user: toPublicUser(user), ...(await issueTokens(user))};
};

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
    const tokenHash = hashToken(refreshToken);
    const userId = await tokenRepo.consumeRefreshToken(tokenHash);

    if(userId === null){
        const existing = await tokenRepo.findRefreshToken(tokenHash);
        if(existing?.revoked_at){
            await tokenRepo.revokeAllForUser(existing.user_id as any);
        }
        throw new HttpError(401, 'Invalid or expired refresh token');
    }

    const user = await findUserById(userId);
    if(!user) throw new HttpError(401, 'Invalid or expired refresh token');
    return issueTokens(user);
}

export const logout = async (refreshToken: string): Promise<void> => {
    await tokenRepo.revokeRefreshToken(hashToken(refreshToken));
}

export const getProfile = async (userId: number): Promise<PublicUser> => {
    const user = await findUserById(userId);
    if(!user) throw new HttpError(401, 'Account no longer exists');
    return toPublicUser(user);
}




