import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser, Role } from '../types';

export const signAccessToken = (user: {id: number; role: Role}): string => 
    jwt.sign({role: user.role}, env.jwtSecret, {
        algorithm: 'HS256',
        subject: String(user.id),
        expiresIn: env.accessTokenTtlSeconds,
    });

export const verifyAccessToken = (token: string): AuthUser => {
    const payload = jwt.verify(token, env.jwtSecret, {algorithms: ['HS256']});
    if(typeof payload === 'string' || !payload.sub) throw new Error('Malformed token');

    const id = Number(payload.sub);
    const role = payload.role;
    if(!Number.isInteger(id) || role !== 'ADMIN' && role !== 'USER') 
        throw new Error('Malformed token');

    return {id, role};
};

export const generateRefreshToken = (): string => crypto.randomBytes(48).toString('base64url');

export const hashToken = (token: string): string => 
    crypto.createHash('sha256').update(token).digest('hex');
