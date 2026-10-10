import * as bookingRepo from '../repository/booking.repository';
import { findUserById } from '../repository/user.repository';
import { findResourceById } from '../repository/resource.repository';
import { CreateBookingInput, Booking } from '../types';
import { HttpError } from '../utils/HttpError';

export const getAllBookings = async (): Promise<Booking[]> => bookingRepo.findAllBookings();

export const getBookingById = async (id: number): Promise<Booking> => {
    const booking = await bookingRepo.findBookingById(id);
    if(!booking){
        throw new HttpError(404, `Booking ${id} not found`);
    }
    return booking;
}

export const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    const {user_id, resource_id, start_time, end_time} = input;

    if(!Number.isInteger(user_id) || !Number.isInteger(resource_id)){
        throw new HttpError(400, 'User ID and Resource ID must be valid integers');
    }

    if(typeof start_time !== 'string' || typeof end_time !== 'string'){
        throw new HttpError(400, 'Start time and end time are required (ISO date-time strings)');
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if(end <= start){
        throw new HttpError(400, 'End time must be after start time');
    }

    if(!(await findUserById(user_id))){
        throw new HttpError(404, `User ${user_id} not found`);
    }

    if(!(await findResourceById(resource_id))){
        throw new HttpError(404, `Resource ${resource_id} not found`);
    }

    return bookingRepo.createBooking(input);
}

export const cancelBooking = async (id: number): Promise<Booking> => {
    const booking = await getBookingById(id);
    if(booking.status === 'CANCELLED'){
        throw new HttpError(400, `Booking ${id} is already cancelled`);
    }

    const cancelled = await bookingRepo.cancelBooking(id);
    if(!cancelled){
        throw new HttpError(404, `Booking ${id} not found`);
    }
    return cancelled;
}