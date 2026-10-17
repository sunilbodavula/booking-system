import * as bookingRepo from '../repository/booking.repository';
import { findUserById } from '../repository/user.repository';
import { findResourceById } from '../repository/resource.repository';
import { CreateBookingInput, Booking, BookingListQuery, PaginatedResult, AuthUser } from '../types';
import { HttpError } from '../utils/HttpError';
import { toPage } from '../utils/pagination';
import { emitBookingCancelled, emitBookingCreated } from '../realtime/socket';

const canAccess = (booking: Booking, actor: AuthUser): boolean => 
    actor.role === 'ADMIN' || booking.user_id === actor.id;

//export const getAllBookings = async (): Promise<Booking[]> => bookingRepo.findAllBookings();
export const listBookings = async (query: BookingListQuery, actor: AuthUser): Promise<PaginatedResult<Booking>> => {
    const { page, limit, sort, order, ...filters } = query;

    if(actor.role !== 'ADMIN'){
        if(filters.user_id !== undefined && filters.user_id !== actor.id){
            throw new HttpError(403, 'You can only view your own bookings')
        }
        filters.user_id = actor.id
    }

    const { rows, total } = await bookingRepo.findBookingsPage(filters, sort, order, limit, (page - 1) * limit);
    return toPage(rows, total, page, limit);
}

export const getBookingById = async (id: number, actor: AuthUser): Promise<Booking> => {
    const booking = await bookingRepo.findBookingById(id);
    if(!booking || !canAccess(booking, actor)){
        throw new HttpError(404, `Booking ${id} not found`);
    }
    return booking;
}

export const createBooking = async (userId: number, input: CreateBookingInput): Promise<Booking> => {
    if(!(await findResourceById(input.resource_id))){
        throw new HttpError(404, `Resource ${input.resource_id} not found`);
    }
    const booking = await bookingRepo.createBooking(userId, input);
    emitBookingCreated(booking.resource_id, booking);
    return booking;
}

export const cancelBooking = async (id: number, actor: AuthUser): Promise<Booking> => {
    const booking = await getBookingById(id, actor);
    if(booking.status === 'CANCELLED'){
        throw new HttpError(400, `Booking ${id} is already cancelled`);
    }

    const cancelled = await bookingRepo.cancelBooking(id);
    if(!cancelled){
        throw new HttpError(404, `Booking ${id} not found`);
    }
    emitBookingCancelled(cancelled.resource_id, cancelled.id);
    return cancelled;
}