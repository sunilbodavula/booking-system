import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { HttpError } from '../utils/HttpError';

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