import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { parseId } from '../utils/parseId';

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    res.json(await bookingService.getAllBookings());
}

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    res.json(await bookingService.getBookingById(parseId(id)));
}

export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const booking = await bookingService.createBooking(req.body ?? {});
    res.status(201).json(booking);
}

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const cancelled = await bookingService.cancelBooking(parseId(id));
    res.json(cancelled);
}