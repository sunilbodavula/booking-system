import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { HttpError } from '../utils/HttpError';
import { getAuthUser } from './authenticate';

export const requireRole = 
(...allowed: Role[]) => 
(_req: Request, res: Response, next: NextFunction): void  => {
    const user = getAuthUser(res);
    if(!allowed.includes(user.role)){
        throw new HttpError(403, 'You do not have permission to perform this action');
    }

    next();
}