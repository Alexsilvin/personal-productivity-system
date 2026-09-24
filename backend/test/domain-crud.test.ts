import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { pool, query } from '../src/infrastructure/database/client.js';
import { runMigrations } from '../src/infrastructure/database/migrations.js';

const databaseTests = process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

async function createUser(email: string) {
  const result = await query<{ id: string }>(
    `INSERT INTO users (email, name, timezone) VALUES ($1, $2, 'UTC') RETURNING id;`,
    [email, 'Domain Test User'],
  );

  return result.rows[0].id as string;
}

interface GoalPayload {
  userId: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  targetDate?: string | null;
}

interface ProjectPayload {
  userId: string;
  goalId?: string | null;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
}

interface CoursePayload {
  userId: string;
  title: string;
  description?: string | null;
  status?: string;
}

function buildGoalPayload(userId: string, overrides: Partial<GoalPayload> = {}): GoalPayload {
  return {
    userId,
    title: 'Goal title',
    description: 'Goal description',
    status: 'active',
    priority: 'important',
    targetDate: '2026-12-31',
    ...overrides,
  };
}

function buildProjectPayload(userId: string, overrides: Partial<ProjectPayload> = {}): ProjectPayload {
  return {
    userId,
    goalId: null,
    title: 'Project title',
    description: 'Project description',
    status: 'active',
    priority: 'normal',
    ...overrides,
  };
}

function buildCoursePayload(userId: string, overrides: Partial<CoursePayload> = {}): CoursePayload {
  return {
    userId,
    title: 'Course title',
    description: 'Course description',
    status: 'active',
    ...overrides,
  };
}

databaseTests('goal project course CRUD', () => {
  beforeAll(async () => {
    await runMigrations();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates goals with validation and ownership checks', async () => {
    const userAId = await createUser(`goal-user-a-${Date.now()}@example.com`);
    const userBId = await createUser(`goal-user-b-${Date.now()}@example.com`);

    const validGoal = await app.inject({
      method: 'POST',
      url: '/goals',
      payload: buildGoalPayload(userAId),
    });
    expect(validGoal.statusCode).toBe(201);
    expect(validGoal.json()).toMatchObject({ userId: userAId, title: 'Goal title' });

    const invalidGoal = await app.inject({
      method: 'POST',
      url: '/goals',
      payload: {
        userId: userAId,
        title: '',
      },
    });
    expect(invalidGoal.statusCode).toBe(400);
    expect(invalidGoal.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });

    const missingUserGoal = await app.inject({
      method: 'POST',
      url: '/goals',
      payload: buildGoalPayload('11111111-1111-4111-8111-111111111111'),
    });
    expect(missingUserGoal.statusCode).toBe(404);
    expect(missingUserGoal.json()).toMatchObject({ error: { code: 'USER_NOT_FOUND' } });

    const goalFromB = await app.inject({
      method: 'GET',
      url: `/goals/${validGoal.json().id}?user_id=${userBId}`,
    });
    expect(goalFromB.statusCode).toBe(404);
    expect(goalFromB.json()).toMatchObject({ error: { code: 'GOAL_NOT_FOUND' } });

    const listGoals = await app.inject({
      method: 'GET',
      url: `/goals?user_id=${userAId}&limit=10&offset=0`,
    });
    expect(listGoals.statusCode).toBe(200);
    expect(listGoals.json().items).toHaveLength(1);
  });

  it('creates and validates projects with same-user goal relationships and null-clearing', async () => {
    const userAId = await createUser(`project-user-a-${Date.now()}@example.com`);
    const userBId = await createUser(`project-user-b-${Date.now()}@example.com`);

    const sameUserGoal = await app.inject({
      method: 'POST',
      url: '/goals',
      payload: buildGoalPayload(userAId, { title: 'Project goal' }),
    });
    expect(sameUserGoal.statusCode).toBe(201);

    const otherUserGoal = await app.inject({
      method: 'POST',
      url: '/goals',
      payload: buildGoalPayload(userBId, { title: 'Other user goal' }),
    });
    expect(otherUserGoal.statusCode).toBe(201);

    const validProject = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: buildProjectPayload(userAId, {
        goalId: sameUserGoal.json().id,
        title: 'Linked project',
      }),
    });
    expect(validProject.statusCode).toBe(201);
    expect(validProject.json()).toMatchObject({ userId: userAId, goalId: sameUserGoal.json().id });

    const crossUserGoalProject = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: buildProjectPayload(userAId, {
        goalId: otherUserGoal.json().id,
        title: 'Bad project',
      }),
    });
    expect(crossUserGoalProject.statusCode).toBe(409);
    expect(crossUserGoalProject.json()).toMatchObject({ error: { code: 'GOAL_OWNERSHIP_MISMATCH' } });

    const getProject = await app.inject({
      method: 'GET',
      url: `/projects/${validProject.json().id}?user_id=${userAId}`,
    });
    expect(getProject.statusCode).toBe(200);

    const crossUserGet = await app.inject({
      method: 'GET',
      url: `/projects/${validProject.json().id}?user_id=${userBId}`,
    });
    expect(crossUserGet.statusCode).toBe(404);

    const clearGoal = await app.inject({
      method: 'PATCH',
      url: `/projects/${validProject.json().id}?user_id=${userAId}`,
      payload: {
        goalId: null,
        description: null,
      },
    });
    expect(clearGoal.statusCode).toBe(200);
    expect(clearGoal.json()).toMatchObject({
      goalId: null,
      description: null,
    });

    const updateOnly = await app.inject({
      method: 'PATCH',
      url: `/projects/${validProject.json().id}?user_id=${userAId}`,
      payload: { title: 'Updated title only' },
    });
    expect(updateOnly.statusCode).toBe(200);
    expect(updateOnly.json()).toMatchObject({
      title: 'Updated title only',
      goalId: null,
      description: null,
    });
  });

  it('creates, lists, updates, deletes courses and rejects cross-user access', async () => {
    const userAId = await createUser(`course-user-a-${Date.now()}@example.com`);
    const userBId = await createUser(`course-user-b-${Date.now()}@example.com`);

    const courseA = await app.inject({
      method: 'POST',
      url: '/courses',
      payload: buildCoursePayload(userAId, { title: 'Math 101' }),
    });
    expect(courseA.statusCode).toBe(201);

    const courseB = await app.inject({
      method: 'POST',
      url: '/courses',
      payload: buildCoursePayload(userBId, { title: 'Other Math 101' }),
    });
    expect(courseB.statusCode).toBe(201);

    const list = await app.inject({
      method: 'GET',
      url: `/courses?user_id=${userAId}&limit=10&offset=0`,
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().items).toHaveLength(1);

    const crossUserGet = await app.inject({
      method: 'GET',
      url: `/courses/${courseA.json().id}?user_id=${userBId}`,
    });
    expect(crossUserGet.statusCode).toBe(404);

    const update = await app.inject({
      method: 'PATCH',
      url: `/courses/${courseA.json().id}?user_id=${userAId}`,
      payload: { title: 'Updated course title' },
    });
    expect(update.statusCode).toBe(200);
    expect(update.json()).toMatchObject({ title: 'Updated course title' });

    const deleteCourse = await app.inject({
      method: 'DELETE',
      url: `/courses/${courseA.json().id}?user_id=${userAId}`,
    });
    expect(deleteCourse.statusCode).toBe(204);

    const fetchDeleted = await app.inject({
      method: 'GET',
      url: `/courses/${courseA.json().id}?user_id=${userAId}`,
    });
    expect(fetchDeleted.statusCode).toBe(404);
  });
});
