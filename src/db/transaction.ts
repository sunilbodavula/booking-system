import { PoolClient, QueryResult, QueryResultRow } from "pg";
import pool  from '../config/db';

export interface Queryable {
    query<R extends QueryResultRow = any>(text: string, values?: unknown[]): Promise<QueryResult<R>>;
}

export const withTransaction = async <T>(work: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();

    let broken = false;
    try{
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    }catch(err){
        try{
            await client.query('ROLLBACK')
        }catch{
            broken = true;
        }
        throw err;
    }finally {
        client.release(broken)
    }
};