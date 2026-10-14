import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { parseId } from '../utils/parseId';
import { BookingListQuery } from '../types';
import { getAuthUser } from '../middleware/authenticate';

export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
    res.json(await bookingService.listBookings(res.locals.query as BookingListQuery, getAuthUser(res)));
}

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    res.json(await bookingService.getBookingById(parseId(id), getAuthUser(res)));
}

export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const booking = await bookingService.createBooking(getAuthUser(res).id, req.body);
    res.status(201).json(booking);
}

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const cancelled = await bookingService.cancelBooking(parseId(id), getAuthUser(res));
    res.json(cancelled);
}