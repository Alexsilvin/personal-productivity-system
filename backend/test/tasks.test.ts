import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { pool, query } from '../src/infrastructure/database/client.js';
import { runMigrations } from '../src/infrastructure/database/migrations.js';

const databaseTests = process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

async function createUser(email: string) {
  const result = await query<{ id: string }>(
    `
      INSERT INTO users (email, name, timezone)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
    [email, 'Task Test User', 'UTC'],
  );

  return result.rows[0].id as string;
}

interface TaskRequestPayload {
  userId: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  estimatedDurationMinutes?: number;
  minimumDurationMinutes?: number;
  dueAt?: string | null;
  projectId?: string | null;
  courseId?: string | null;
  goalId?: string | null;
}

function buildTaskPayload(userId: string, overrides: Partial<TaskRequestPayload> = {}): TaskRequestPayload {
  return {
    userId,
    title: 'Draft task title',
    description: 'Task description',
    status: 'draft',
    priority: 'normal',
    estimatedDurationMinutes: 60,
    minimumDurationMinutes: 30,
    dueAt: '2026-10-10T09:00:00.000Z',
    projectId: null,
    courseId: null,
    goalId: null,
    ...overrides,
  };
}

databaseTests('task CRUD API', () => {
  beforeAll(async () => {
    await runMigrations();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates a valid task', async () => {
    const userId = await createUser(`create-task-${Date.now()}@example.com`);
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      userId,
      title: 'Draft task title',
      status: 'draft',
      priority: 'normal',
    });
    expect(response.json()).toHaveProperty('id');
    expect(response.json()).toHaveProperty('createdAt');
  });

  it('rejects invalid task payloads', async () => {
    const userId = await createUser(`invalid-task-${Date.now()}@example.com`);
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        userId,
        title: '',
        estimatedDurationMinutes: 0,
        minimumDurationMinutes: 20,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
  });

  it('rejects nonexistent users and invalid relationship references', async () => {
    const missingUserResponse = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload('11111111-1111-4111-8111-111111111111'),
    });

    expect(missingUserResponse.statusCode).toBe(404);
    expect(missingUserResponse.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
    });

    const userId = await createUser(`missing-relation-${Date.now()}@example.com`);
    const invalidRelationResponse = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        projectId: '11111111-1111-4111-8111-111111111111',
      }),
    });

    expect(invalidRelationResponse.statusCode).toBe(404);
    expect(invalidRelationResponse.json()).toMatchObject({
      error: { code: 'PROJECT_NOT_FOUND' },
    });
  });

  it('retrieves, lists, filters, paginates, updates, and deletes tasks', async () => {
    const userId = await createUser(`crud-task-${Date.now()}@example.com`);
    const otherUserId = await createUser(`crud-other-${Date.now()}@example.com`);

    const createdOne = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        title: 'Alpha task',
        status: 'queued',
        priority: 'important',
      }),
    });

    const createdTwo = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        title: 'Beta task',
        status: 'draft',
      }),
    });

    const createdThree = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(otherUserId, {
        title: 'Other user task',
        status: 'blocked',
      }),
    });

    expect(createdOne.statusCode).toBe(201);
    expect(createdTwo.statusCode).toBe(201);
    expect(createdThree.statusCode).toBe(201);

    const fetchResponse = await app.inject({
      method: 'GET',
      url: `/tasks/${createdOne.json().id}`,
    });

    expect(fetchResponse.statusCode).toBe(200);
    expect(fetchResponse.json()).toMatchObject({
      id: createdOne.json().id,
      userId,
      title: 'Alpha task',
    });

    const listResponse = await app.inject({
      method: 'GET',
      url: `/tasks?user_id=${userId}`,
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items).toHaveLength(2);
    expect(listResponse.json().items.map((task: { title: string }) => task.title)).toEqual(
      expect.arrayContaining(['Alpha task', 'Beta task']),
    );

    const listPaginatedResponse = await app.inject({
      method: 'GET',
      url: `/tasks?user_id=${userId}&limit=1&offset=1`,
    });

    expect(listPaginatedResponse.statusCode).toBe(200);
    expect(listPaginatedResponse.json().items).toHaveLength(1);
    expect(listPaginatedResponse.json().total).toBe(2);

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/tasks/${createdOne.json().id}`,
      payload: {
        title: 'Updated alpha task',
        status: 'in_progress',
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      id: createdOne.json().id,
      title: 'Updated alpha task',
      status: 'in_progress',
    });

    const missingTaskResponse = await app.inject({
      method: 'GET',
      url: '/tasks/11111111-1111-4111-8111-111111111111',
    });

    expect(missingTaskResponse.statusCode).toBe(404);
    expect(missingTaskResponse.json()).toMatchObject({
      error: { code: 'TASK_NOT_FOUND' },
    });

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/tasks/${createdOne.json().id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    const afterDelete = await app.inject({
      method: 'GET',
      url: `/tasks/${createdOne.json().id}`,
    });

    expect(afterDelete.statusCode).toBe(404);

    const deleteMissingResponse = await app.inject({
      method: 'DELETE',
      url: `/tasks/${createdTwo.json().id}`,
    });

    expect(deleteMissingResponse.statusCode).toBe(204);
  });

  it('rejects cross-user task relationships on create and update', async () => {
    const userAId = await createUser(`owner-a-${Date.now()}@example.com`);
    const userBId = await createUser(`owner-b-${Date.now()}@example.com`);

    const projectForB = await query<{ id: string }>(
      `INSERT INTO projects (user_id, title, status, priority) VALUES ($1, 'Project B', 'active', 'normal') RETURNING id;`,
      [userBId],
    );
    const courseForB = await query<{ id: string }>(
      `INSERT INTO courses (user_id, title, status) VALUES ($1, 'Course B', 'active') RETURNING id;`,
      [userBId],
    );
    const goalForB = await query<{ id: string }>(
      `INSERT INTO goals (user_id, title, status, priority) VALUES ($1, 'Goal B', 'active', 'important') RETURNING id;`,
      [userBId],
    );

    const createProjectMismatch = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userAId, { projectId: projectForB.rows[0].id }),
    });
    expect(createProjectMismatch.statusCode).toBe(409);
    expect(createProjectMismatch.json()).toMatchObject({ error: { code: 'PROJECT_OWNERSHIP_MISMATCH' } });

    const createCourseMismatch = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userAId, { courseId: courseForB.rows[0].id }),
    });
    expect(createCourseMismatch.statusCode).toBe(409);
    expect(createCourseMismatch.json()).toMatchObject({ error: { code: 'COURSE_OWNERSHIP_MISMATCH' } });

    const createGoalMismatch = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userAId, { goalId: goalForB.rows[0].id }),
    });
    expect(createGoalMismatch.statusCode).toBe(409);
    expect(createGoalMismatch.json()).toMatchObject({ error: { code: 'GOAL_OWNERSHIP_MISMATCH' } });

    const ownerATask = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userAId, { title: 'User A task' }),
    });
    expect(ownerATask.statusCode).toBe(201);

    const updateProjectMismatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${ownerATask.json().id}`,
      payload: { projectId: projectForB.rows[0].id },
    });
    expect(updateProjectMismatch.statusCode).toBe(409);
    expect(updateProjectMismatch.json()).toMatchObject({ error: { code: 'PROJECT_OWNERSHIP_MISMATCH' } });

    const updateCourseMismatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${ownerATask.json().id}`,
      payload: { courseId: courseForB.rows[0].id },
    });
    expect(updateCourseMismatch.statusCode).toBe(409);
    expect(updateCourseMismatch.json()).toMatchObject({ error: { code: 'COURSE_OWNERSHIP_MISMATCH' } });

    const updateGoalMismatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${ownerATask.json().id}`,
      payload: { goalId: goalForB.rows[0].id },
    });
    expect(updateGoalMismatch.statusCode).toBe(409);
    expect(updateGoalMismatch.json()).toMatchObject({ error: { code: 'GOAL_OWNERSHIP_MISMATCH' } });

    const validProject = await query<{ id: string }>(
      `INSERT INTO projects (user_id, title, status, priority) VALUES ($1, 'Project A', 'active', 'normal') RETURNING id;`,
      [userAId],
    );
    const validCourse = await query<{ id: string }>(
      `INSERT INTO courses (user_id, title, status) VALUES ($1, 'Course A', 'active') RETURNING id;`,
      [userAId],
    );
    const validGoal = await query<{ id: string }>(
      `INSERT INTO goals (user_id, title, status, priority) VALUES ($1, 'Goal A', 'active', 'important') RETURNING id;`,
      [userAId],
    );

    const validCreate = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userAId, {
        title: 'Valid linked task',
        projectId: validProject.rows[0].id,
        courseId: validCourse.rows[0].id,
        goalId: validGoal.rows[0].id,
      }),
    });
    expect(validCreate.statusCode).toBe(201);
  });

  it('allows explicit nulls in PATCH while keeping other values unchanged and preserves duration invariants', async () => {
    const userId = await createUser(`nullable-task-${Date.now()}@example.com`);

    const createTask = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        title: 'Nullable task',
        description: 'Before clearing',
        projectId: '11111111-1111-4111-8111-111111111111',
        courseId: '11111111-1111-4111-8111-111111111111',
        goalId: '11111111-1111-4111-8111-111111111111',
        dueAt: '2026-10-10T09:00:00.000Z',
        completedAt: '2026-10-12T09:00:00.000Z',
      }),
    });
    expect(createTask.statusCode).toBe(404);

    const validProject = await query<{ id: string }>(
      `INSERT INTO projects (user_id, title, status, priority) VALUES ($1, 'Project for nullable task', 'active', 'normal') RETURNING id;`,
      [userId],
    );
    const validCourse = await query<{ id: string }>(
      `INSERT INTO courses (user_id, title, status) VALUES ($1, 'Course for nullable task', 'active') RETURNING id;`,
      [userId],
    );
    const validGoal = await query<{ id: string }>(
      `INSERT INTO goals (user_id, title, status, priority) VALUES ($1, 'Goal for nullable task', 'active', 'important') RETURNING id;`,
      [userId],
    );

    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        title: 'Nullable task',
        description: 'Before clearing',
        projectId: validProject.rows[0].id,
        courseId: validCourse.rows[0].id,
        goalId: validGoal.rows[0].id,
        dueAt: '2026-10-10T09:00:00.000Z',
        completedAt: '2026-10-12T09:00:00.000Z',
      }),
    });
    expect(created.statusCode).toBe(201);

    const clearResponse = await app.inject({
      method: 'PATCH',
      url: `/tasks/${created.json().id}`,
      payload: {
        projectId: null,
        courseId: null,
        goalId: null,
        description: null,
        dueAt: null,
        completedAt: null,
      },
    });

    expect(clearResponse.statusCode).toBe(200);
    expect(clearResponse.json()).toMatchObject({
      projectId: null,
      courseId: null,
      goalId: null,
      description: null,
      dueAt: null,
      completedAt: null,
    });

    const titleOnlyResponse = await app.inject({
      method: 'PATCH',
      url: `/tasks/${created.json().id}`,
      payload: { title: 'Updated title only' },
    });

    expect(titleOnlyResponse.statusCode).toBe(200);
    expect(titleOnlyResponse.json()).toMatchObject({
      title: 'Updated title only',
      projectId: null,
      courseId: null,
      goalId: null,
      description: null,
      dueAt: null,
      completedAt: null,
    });

    const durationTask = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: buildTaskPayload(userId, {
        title: 'Duration validation task',
        estimatedDurationMinutes: 60,
        minimumDurationMinutes: 30,
      }),
    });
    expect(durationTask.statusCode).toBe(201);

    const invalidMinimumPatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${durationTask.json().id}`,
      payload: { minimumDurationMinutes: 90 },
    });
    expect(invalidMinimumPatch.statusCode).toBe(400);
    expect(invalidMinimumPatch.json()).toMatchObject({ error: { code: 'INVALID_TASK_DURATION' } });

    const invalidEstimatedPatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${durationTask.json().id}`,
      payload: { estimatedDurationMinutes: 20 },
    });
    expect(invalidEstimatedPatch.statusCode).toBe(400);
    expect(invalidEstimatedPatch.json()).toMatchObject({ error: { code: 'INVALID_TASK_DURATION' } });
  });
});
