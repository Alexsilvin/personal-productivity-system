import { query } from '../../infrastructure/database/client.js';
import type { TaskPriority, TaskRecord, TaskStatus } from '../domain.js';

export interface TaskListFilters {
  userId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  courseId?: string;
  goalId?: string;
}

interface TaskRow {
  id: string;
  user_id: string;
  project_id: string | null;
  course_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_duration_minutes: number;
  minimum_duration_minutes: number;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapTaskRow(row: TaskRow): TaskRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    courseId: row.course_id,
    goalId: row.goal_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimatedDurationMinutes: Number(row.estimated_duration_minutes),
    minimumDurationMinutes: Number(row.minimum_duration_minutes),
    dueAt: row.due_at ? new Date(row.due_at).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class TaskRepository {
  async createTask(input: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<TaskRecord> {
    const result = await query<TaskRow>(
      `
        INSERT INTO tasks (
          user_id,
          project_id,
          course_id,
          goal_id,
          title,
          description,
          status,
          priority,
          estimated_duration_minutes,
          minimum_duration_minutes,
          due_at,
          completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `,
      [
        input.userId,
        input.projectId,
        input.courseId,
        input.goalId,
        input.title,
        input.description,
        input.status,
        input.priority,
        input.estimatedDurationMinutes,
        input.minimumDurationMinutes,
        input.dueAt,
        input.completedAt,
      ],
    );

    return mapTaskRow(result.rows[0]);
  }

  async findTaskById(id: string): Promise<TaskRecord | null> {
    const result = await query<TaskRow>(`SELECT * FROM tasks WHERE id = $1;`, [id]);
    return result.rows[0] ? mapTaskRow(result.rows[0]) : null;
  }

  async findUserById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM users WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async findProjectById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM projects WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async findCourseById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM courses WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async findGoalById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM goals WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async listTasks(filters: TaskListFilters, limit: number, offset: number): Promise<{ items: TaskRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(filters.userId);
    }
    if (filters.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`priority = $${params.length + 1}`);
      params.push(filters.priority);
    }
    if (filters.projectId) {
      conditions.push(`project_id = $${params.length + 1}`);
      params.push(filters.projectId);
    }
    if (filters.courseId) {
      conditions.push(`course_id = $${params.length + 1}`);
      params.push(filters.courseId);
    }
    if (filters.goalId) {
      conditions.push(`goal_id = $${params.length + 1}`);
      params.push(filters.goalId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM tasks ${whereClause};`, params);
    const dataResult = await query<TaskRow>(
      `
        SELECT *
        FROM tasks
        ${whereClause}
        ORDER BY created_at DESC, id
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2};
      `,
      [...params, limit, offset],
    );

    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: dataResult.rows.map(mapTaskRow),
    };
  }

  async updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null> {
    const assignments: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || key === 'id' || key === 'userId' || key === 'createdAt' || key === 'updatedAt') {
        continue;
      }

      const dbColumn = key
        .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
        .replace(/^_/, '');

      assignments.push(`${dbColumn} = $${params.length + 1}`);
      params.push(value);
    }

    if (assignments.length === 0) {
      return this.findTaskById(id);
    }

    params.push(id);

    const result = await query<TaskRow>(
      `
        UPDATE tasks
        SET ${assignments.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length}
        RETURNING *;
      `,
      params,
    );

    return result.rows[0] ? mapTaskRow(result.rows[0]) : null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`DELETE FROM tasks WHERE id = $1 RETURNING id;`, [id]);
    return result.rows.length > 0;
  }
}

export const taskRepository = new TaskRepository();
