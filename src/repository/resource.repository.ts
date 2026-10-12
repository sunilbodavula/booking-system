import pool from '../config/db';
import { Resource, ResourceInput } from '../types/index';
import { ResourceListQuery } from '../types';
import { WhereBuilder, escapeLike } from '../utils/sql';

// export const findAllResources = async (): Promise<Resource[]> => {
//     const result = await pool.query<Resource>('SELECT * FROM resources order by id');
//     return result.rows;
// }

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

const RESOURCE_SORT_COLUMNS: Record<ResourceListQuery['sort'], string> = {
  id: 'id',
  name: 'name',
  capacity: 'capacity',
  created_at: 'created_at',
};

type ResourceFilters = Pick<ResourceListQuery, 'search' | 'min_capacity'>;

export const findResourcesPage = async (
  filters: ResourceFilters,
  sort: ResourceListQuery['sort'],
  order: ResourceListQuery['order'],
  limit: number,
  offset: number
): Promise<{ rows: Resource[]; total: number }> => {
  const where = new WhereBuilder();
  if (filters.search) where.add('name ILIKE ?', `%${escapeLike(filters.search)}%`);
  if (filters.min_capacity !== undefined) where.add('capacity >= ?', filters.min_capacity);

  const whereSql = where.toSql();
  const n = where.values.length;
  const direction = order === 'desc' ? 'DESC' : 'ASC';

  const [data, count] = await Promise.all([
    pool.query<Resource>(
      `SELECT * FROM resources ${whereSql}
       ORDER BY ${RESOURCE_SORT_COLUMNS[sort]} ${direction}, id ASC
       LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...where.values, limit, offset]
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM resources ${whereSql}`, where.values),
  ]);

  return { rows: data.rows, total: Number(count.rows[0].count) };
};