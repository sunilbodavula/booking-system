import pool from '../config/db';
import { User } from '../types/index';
import { Queryable } from '../db/transaction';

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query<User>(
        'SELECT * FROM users WHERE email = $1', [email]
    );

    return result.rows[0] ?? null;
}

export const findUserById = async (id: number): Promise<User | null> => {

    const result = await pool.query<User>(
        'SELECT * FROM users WHERE id = $1', [id]
    );

    return result.rows[0] ?? null;
}

export const createUser = async (
    name: string,
    email: string,
    hashedPassword: string,
    db: Queryable = pool
): Promise<User> => {
    const result = await db.query<User>(
        `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING *`, 
        [name, email, hashedPassword]
    );

    return result.rows[0];
}