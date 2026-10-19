import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret || jwtSecret.length < 32){
    throw new Error('JWT_SECRET must be set in .env file and be atleast 32 characters long');
}

export const env = {
    jwtSecret,
    accessTokenTtlSeconds: 15 * 60,
    refreshTokenTtlDays: 7,
    bcryptCost: 12
}