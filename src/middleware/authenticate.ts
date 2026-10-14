import { Request, Response, NextFunction, response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types';
import { HttpError } from '../utils/HttpError';
import { verifyAccessToken } from '../utils/token';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;

    if(!header || !header.startsWith('Bearer ')){
        res.setHeader('WWW-Authenticate', 'Bearer');
        next(new HttpError(401, 'Authentication required'));
        return;
    }

    try {
        res.locals.user = verifyAccessToken(header.slice(7).trim());
        next();
    }catch(err){
        res.setHeader('WWW-Authenticate', 'Bearer');
        const message = err instanceof jwt.TokenExpiredError ? 'Access token expired' : 'Invalid access token';
        next(new HttpError(401, message));
    }

};

export const getAuthUser = (res: Response): AuthUser => {
    const user = res.locals.user as AuthUser | undefined;
    if(!user) throw new HttpError(401, 'Authentication required');
    return user;
}


