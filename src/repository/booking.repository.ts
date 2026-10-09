import pool from '../config/db';
import { Booking, CreateBookingInput } from '../types/index';

export const findAllBookings = async (): Promise<Booking[]> => {
    const result = await pool.query<Booking>(
        'SELECT * FROM bookings ORDER BY start_time'
    );
    return result.rows;
}

export const findBookingById = async (id: number): Promise<Booking | null> => {
    const result = await pool.query<Booking>(
        'SELECT * FROM bookings WHERE id = $1', [id]
    );

    return result.rows[0] ?? null;
}

export const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    const result = await pool.query<Booking>(
        `INSERT INTO bookings (user_id, resource_id, start_time, end_time)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [input.user_id, input.resource_id, input.start_time, input.end_time]
    );
    return result.rows[0];
}

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