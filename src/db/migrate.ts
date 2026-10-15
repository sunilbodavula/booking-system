import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import { withTransaction } from './transaction';
import { endsWith } from 'zod';

const MIGRATION_DIR = path.join(__dirname, 'migrations');

async function migrate(): Promise<void> {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
    );

    const result = await pool.query<{filename: string}>('SELECT filename FROM schema_migrations');
    const applied = new Set(result.rows.map((row) => row.filename));
    const files = fs.readdirSync(MIGRATION_DIR).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files){
        if(applied.has(file)){
            console.log(`Skip ${file}`);
            continue;
        }
        const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf-8');
        await withTransaction(async (client) => {
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        });
        console.log(`apply ${file}`);
    }
}

migrate()
.then(() => console.log('Migrations up to date'))
.catch((err) => {
    console.log('Migrations failed: ' + err);
    process.exitCode = 1;
})
.finally(() => pool.end());