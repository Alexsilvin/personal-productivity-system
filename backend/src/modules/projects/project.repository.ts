import { query } from '../../infrastructure/database/client.js';
import type { ProjectRecord, ProjectStatus, TaskPriority } from '../domain.js';

export interface ProjectListFilters {
  userId?: string;
  goalId?: string;
  status?: ProjectStatus;
  priority?: TaskPriority;
}

interface ProjectRow {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

function mapProjectRow(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    goalId: row.goal_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class ProjectRepository {
  async createProject(input: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectRecord> {
    const result = await query<ProjectRow>(
      `
        INSERT INTO projects (user_id, goal_id, title, description, status, priority)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [input.userId, input.goalId, input.title, input.description, input.status, input.priority],
    );

    return mapProjectRow(result.rows[0]);
  }

  async findProjectById(id: string): Promise<ProjectRecord | null> {
    const result = await query<ProjectRow>(`SELECT * FROM projects WHERE id = $1;`, [id]);
    return result.rows[0] ? mapProjectRow(result.rows[0]) : null;
  }

  async findUserById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM users WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async findGoalById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM goals WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async findGoalForUser(goalId: string, userId: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM goals WHERE id = $1 AND user_id = $2;`, [goalId, userId]);
    return result.rows.length > 0;
  }

  async listProjects(filters: ProjectListFilters, limit: number, offset: number): Promise<{ items: ProjectRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(filters.userId);
    }
    if (filters.goalId) {
      conditions.push(`goal_id = $${params.length + 1}`);
      params.push(filters.goalId);
    }
    if (filters.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`priority = $${params.length + 1}`);
      params.push(filters.priority);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM projects ${whereClause};`, params);
    const dataResult = await query<ProjectRow>(
      `
        SELECT *
        FROM projects
        ${whereClause}
        ORDER BY created_at DESC, id
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2};
      `,
      [...params, limit, offset],
    );

    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: dataResult.rows.map(mapProjectRow),
    };
  }

  async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<ProjectRecord | null> {
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
      return this.findProjectById(id);
    }

    params.push(id);

    const result = await query<ProjectRow>(
      `
        UPDATE projects
        SET ${assignments.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length}
        RETURNING *;
      `,
      params,
    );

    return result.rows[0] ? mapProjectRow(result.rows[0]) : null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`DELETE FROM projects WHERE id = $1 RETURNING id;`, [id]);
    return result.rows.length > 0;
  }
}

export const projectRepository = new ProjectRepository();
