import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types';
import { HttpError } from '../utils/HttpError';
import { verifyAccessToken } from '../utils/token';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('WWW-Authenticate', 'Bearer');
    const header = req.headers.authorization;

    if(!header || !header.startsWith('Bearer ')){
        next(new HttpError(401, 'Authentication required'));
        return;
    }

    try {
        res.locals.user = verifyAccessToken(header.slice(7).trim());
        next();
    }catch(err){
        const message = err instanceof jwt.TokenExpiredError ? 'Access token expired' : 'Invalid access token';
        next(new HttpError(401, message));
    }

};

export const getAuthUser = (res: Response): AuthUser => {
    const user = res.locals.user as AuthUser | undefined;
    if(!user) throw new HttpError(401, 'Authentication required');
    return user;
}


