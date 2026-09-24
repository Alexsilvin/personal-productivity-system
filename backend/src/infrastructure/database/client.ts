import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { config } from '../../config.js';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getDatabaseHealth() {
  const result = await query<{ now: Date }>('SELECT NOW() AS now;');
  return result.rows[0]?.now ?? null;
}
