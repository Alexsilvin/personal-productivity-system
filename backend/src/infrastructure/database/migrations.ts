import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, 'migrations');

async function ensureMigrationTracker() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(50) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getMigrationStatus(): Promise<string[]> {
  await ensureMigrationTracker();

  const result = await query<{ version: string }>(
    `SELECT version FROM schema_migrations ORDER BY applied_at, version;`,
  );

  return result.rows.map((row) => row.version);
}

export async function runMigrations(): Promise<string[]> {
  await ensureMigrationTracker();

  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const applied = await getMigrationStatus();
  const pending = files.filter((file) => {
    const version = file.replace(/\.sql$/, '');
    return !applied.includes(version);
  });

  for (const fileName of pending) {
    const version = fileName.replace(/\.sql$/, '');
    const migrationPath = path.join(migrationsDirectory, fileName);
    const sql = await fs.readFile(migrationPath, 'utf8');

    await query('BEGIN');

    try {
      await query(sql);
      await query('INSERT INTO schema_migrations (version) VALUES ($1);', [version]);
      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  return getMigrationStatus();
}
