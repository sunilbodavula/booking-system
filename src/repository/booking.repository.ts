import pool from '../config/db';
import { Booking, CreateBookingInput } from '../types/index';
import { BookingListQuery } from '../types/index';
import { WhereBuilder } from '../utils/sql';
import { withTransaction } from '../db/transaction';

const BOOKING_LOCK_NAMESPACE = 1;

export const findBookingById = async (id: number): Promise<Booking | null> => {
    const result = await pool.query<Booking>(
        'SELECT * FROM bookings WHERE id = $1', [id]
    );

    return result.rows[0] ?? null;
}

export const createBooking = async (userId: number, input: CreateBookingInput): Promise<Booking> =>
  withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1::int, $2::int)', [
      BOOKING_LOCK_NAMESPACE,
      input.resource_id,
    ]);

    const result = await client.query<Booking>(
      `INSERT INTO bookings (user_id, resource_id, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, input.resource_id, input.start_time, input.end_time]
    );
    return result.rows[0];
  });

  
export const cancelBooking = async (id: number): Promise<Booking | null> => {
    const result = await pool.query<Booking>(
        `UPDATE bookings
        SET status = 'CANCELLED'
        WHERE id = $1
        RETURNING *`,
        [id]
    );
    return result.rows[0] ?? null;
}

const BOOKING_SORT_COLUMNS: Record<BookingListQuery['sort'], string> = {
    id: 'id',
    start_time: 'start_time',
    end_time: 'end_time',
    created_at: 'created_at',
};

type BookinFilters = Omit<BookingListQuery, 'page' | 'limit' | 'sort' | 'order'>;

export const findBookingsPage = async (
    filters: BookinFilters,
    sort: BookingListQuery['sort'],
    order: BookingListQuery['order'],
    limit: number,
    offset: number
): Promise<{rows: Booking[]; total: number}> => {
    const where = new WhereBuilder();
    if(filters.resource_id !== undefined) where.add('resource_id = ?', filters.resource_id);
    if(filters.user_id !== undefined) where.add('user_id = ?', filters.user_id);
    if(filters.status) where.add('status = ?', filters.status);
    if(filters.to) where.add('start_time > ?', filters.to);
    if(filters.from) where.add('end_time < ?', filters.from);

    const whereSql = where.toSql();
    const n = where.values.length;
    const direction = order === 'desc' ? 'DESC' : 'ASC';

    const [data, count] = await Promise.all([
        pool.query<Booking>(
            `SELECT * FROM bookings ${whereSql}
            ORDER BY ${BOOKING_SORT_COLUMNS[sort]} ${direction}, id ASC
            LIMIT $${n + 1} OFFSET $${n + 2}`,
            [...where.values, limit, offset]
        ),
        pool.query<{count: string}>(
            `SELECT COUNT(*) FROM bookings ${whereSql}`, where.values
        ),
    ]);

    return {rows: data.rows, total: Number(count.rows[0].count)};
}