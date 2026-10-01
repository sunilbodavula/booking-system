import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import pool from './config/db';

const PORT: number = Number(process.env.PORT) || 3000;

pool.query('SELECT NOW()', (err: Error | null) => {
    if(err){
        console.error('Database Connection failed: ', err.message);
        process.exit(-1);
    }else{
        console.log('Database connection verified');
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});