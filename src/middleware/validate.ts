import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { HttpError } from '../utils/HttpError';

const toHttpError = (error: ZodError, fallbackField: string): HttpError => {
    const details = error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || fallbackField,
        message: issue.message,
    }));

    return new HttpError(400, 'Validation Failed', details);
}

export const validate = 
    (schema: ZodType) => 
    (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if(!result.success){
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.map(String).join('.') || 'body',
                message: issue.message,
            }));
            next(new HttpError(400, 'Validation failed', errors));
            return;
        }

        req.body = result.data;
        next();
    };

export const validateQuery = 
(schema: ZodType) => 
(req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if(!result.success){
        next(toHttpError(result.error, 'query'));
        return;
    }

    res.locals.query = result.data;
    next();
}