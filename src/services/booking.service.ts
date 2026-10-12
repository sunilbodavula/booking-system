import * as bookingRepo from '../repository/booking.repository';
import { findUserById } from '../repository/user.repository';
import { findResourceById } from '../repository/resource.repository';
import { CreateBookingInput, Booking, BookingListQuery, PaginatedResult } from '../types';
import { HttpError } from '../utils/HttpError';
import { toPage } from '../utils/pagination';

//export const getAllBookings = async (): Promise<Booking[]> => bookingRepo.findAllBookings();
export const listBookings = async (query: BookingListQuery): Promise<PaginatedResult<Booking>> => {
    const { page, limit, sort, order, ...filters } = query;
    const { rows, total } = await bookingRepo.findBookingsPage(filters, sort, order, limit, (page - 1) * limit);
    return toPage(rows, total, page, limit);
}

export const getBookingById = async (id: number): Promise<Booking> => {
    const booking = await bookingRepo.findBookingById(id);
    if(!booking){
        throw new HttpError(404, `Booking ${id} not found`);
    }
    return booking;
}

export const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    if(!(await findUserById(input.user_id))){
        throw new HttpError(404, `User ${input.user_id} not found`);
    }

    if(!(await findResourceById(input.resource_id))){
        throw new HttpError(404, `Resource ${input.resource_id} not found`);
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