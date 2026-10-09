import pool from '../config/db';
import { Resource, ResourceInput } from '../types/index';

export const findAllResources = async (): Promise<Resource[]> => {
    const result = await pool.query<Resource>('SELECT * FROM resources order by id');
    return result.rows;
}

export const findResourceById = async (id: number): Promise<Resource | null> => {
    const result = await pool.query<Resource>(
        'SELECT * FROM resources WHERE id = $1', [id]
    );
    return result.rows[0] ?? null;
}

export const createResource = async (input: ResourceInput): Promise<Resource> => {
    const result = await pool.query<Resource>(
        `INSERT INTO resources (name, description, capacity)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [input.name, input.description ?? null, input.capacity ?? 0]
    );

    return result.rows[0];
}

export const updateResouce = async (id: number, input: ResourceInput): Promise<Resource | null> => {
    const result = await pool.query<Resource>(
        `UPDATE resources
        SET name = $1, description = $2, capacity = $3
        WHERE id = $4
        RETURNING *`,
        [input.name, input.description ?? null, input.capacity ?? 0, id]
    );

    return result.rows[0] ?? null;
}

export const deleteResource = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM resources WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
}