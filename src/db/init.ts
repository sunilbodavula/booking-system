import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function initSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    try {
        await pool.query(schema);
        console.log('Database schema initialized successfully');
    }catch (err) {
        console.error('Error initializing database schema: ', err);
        process.exit(1);
    }finally {
        await pool.end();
    }
}

initSchema();