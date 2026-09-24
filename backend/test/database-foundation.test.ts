import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { pool, query } from '../src/infrastructure/database/client.js';
import { getMigrationStatus, runMigrations } from '../src/infrastructure/database/migrations.js';

const databaseTests = process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseTests('database foundation', () => {
  beforeAll(async () => {
    await runMigrations();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates the migration history and core tables', async () => {
    const [status, tables] = await Promise.all([
      getMigrationStatus(),
      query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('users', 'goals', 'projects', 'courses', 'tasks')
        ORDER BY table_name;
      `),
    ]);

    expect(status).toContain('001_init_core_schema');
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      'courses',
      'goals',
      'projects',
      'tasks',
      'users',
    ]);
  });

  it('enforces unique email addresses and positive task durations', async () => {
    const uniqueEmail = `duplicate-${Date.now()}@example.com`;

    await query(`
      INSERT INTO users (email, name, timezone)
      VALUES ($1, 'Duplicate User', 'UTC');
    `, [uniqueEmail]);

    await expect(
      query(`
        INSERT INTO users (email, name, timezone)
        VALUES ($1, 'Second User', 'UTC');
      `, [uniqueEmail]),
    ).rejects.toThrow();

    await expect(
      query(`
        INSERT INTO tasks (
          user_id,
          title,
          status,
          priority,
          estimated_duration_minutes,
          minimum_duration_minutes
        )
        VALUES (
          (SELECT id FROM users WHERE email = $1),
          'Bad duration task',
          'draft',
          'normal',
          0,
          10
        );
      `, [uniqueEmail]),
    ).rejects.toThrow();
  });
});

it('keeps the health endpoint working', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/health',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    ok: true,
    service: 'personal-productivity-system',
  });
});
