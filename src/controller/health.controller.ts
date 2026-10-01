import { Request, Response } from 'express'

export const getHealth = (req: Request, res: Response) : void => {
    res.json({ status: 'ok', message: 'Booking System Backend is up'});
};