import pool from '../config/db';
import { Queryable } from '../db/transaction';


export interface RefreshTokenRow {
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
    created_at: Date;
}

export const saveRefreshToken = async (
    userId: number, 
    tokenHash: string, 
    expiresAt: Date,
    db: Queryable = pool
): Promise<void> => {
    await db.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
    );
};

export const consumeRefreshToken = async (tokenHash: string): Promise<number | null> => {
    const result = await pool.query<{user_id: number}>(
        `UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
        RETURNING user_id`,[tokenHash]
    );
    return result.rows[0]?.user_id ?? null;
};

export const findRefreshToken = async (tokenHash: string): Promise<RefreshTokenRow | null> => {
    const result = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token_hash = $1',
        [tokenHash]
    );

    return result.rows[0] ?? null;
};

export const revokeRefreshToken = async (tokenHash: string): Promise<void> => {
    await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND  revoked_at IS NULL',
        [tokenHash]
    );
};

export const revokeAllForUser = async (userId: null): Promise<void> => {
    await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
        [userId]
    );
};