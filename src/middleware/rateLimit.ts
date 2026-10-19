import rateLimit from "express-rate-limit";
import { HttpError } from "../utils/HttpError";

const handler = (): never => {
    throw new HttpError(429, 'Too many requests, Please try again later.');
};

const skipInTest = (): boolean => process.env.NODE_ENV === 'test';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    skip: skipInTest,
});

export const bookingWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    skip: skipInTest,
})

export const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    skip: skipInTest,
})