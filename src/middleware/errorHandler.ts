import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/HttpError';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
        return;
    }

    const pgCode = (err as { code?: string}).code;
    if(pgCode === '23503'){
        res.status(400).json({ status: 400, message: 'Referenced record does not exist' });
        return;
    }

    if (pgCode === '23514') {
    res.status(400).json({ status: 400, message: 'Data violates a database rule (e.g. end_time must be after start_time)' });
    return;
  }
  if (pgCode === '23505') {
    res.status(409).json({ status: 409, message: 'Record already exists' });
    return;
  }
  if (pgCode === '22007' || pgCode === '22008' || pgCode === '22P02') {
    res.status(400).json({ status: 400, message: 'Invalid input format' });
    return;
  }

  console.error(err);
  res.status(500).json({ status: 500, message: 'Internal server error' });
}

