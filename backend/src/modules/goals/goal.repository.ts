import { query } from '../../infrastructure/database/client.js';
import type { GoalRecord, GoalStatus, TaskPriority } from '../domain.js';

export interface GoalListFilters {
  userId?: string;
  status?: GoalStatus;
  priority?: TaskPriority;
}

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  priority: TaskPriority;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

function mapGoalRow(row: GoalRow): GoalRecord {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    targetDate: row.target_date,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class GoalRepository {
  async createGoal(input: Omit<GoalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<GoalRecord> {
    const result = await query<GoalRow>(
      `
        INSERT INTO goals (user_id, title, description, status, priority, target_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [input.userId, input.title, input.description, input.status, input.priority, input.targetDate],
    );

    return mapGoalRow(result.rows[0]);
  }

  async findGoalById(id: string): Promise<GoalRecord | null> {
    const result = await query<GoalRow>(`SELECT * FROM goals WHERE id = $1;`, [id]);
    return result.rows[0] ? mapGoalRow(result.rows[0]) : null;
  }

  async findGoalForUser(goalId: string, userId: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM goals WHERE id = $1 AND user_id = $2;`, [goalId, userId]);
    return result.rows.length > 0;
  }

  async findUserById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM users WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async listGoals(filters: GoalListFilters, limit: number, offset: number): Promise<{ items: GoalRecord[]; total: number }> {
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM goals ${whereClause};`, params);
    const dataResult = await query<GoalRow>(
      `
        SELECT *
        FROM goals
        ${whereClause}
        ORDER BY created_at DESC, id
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2};
      `,
      [...params, limit, offset],
    );

    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: dataResult.rows.map(mapGoalRow),
    };
  }

  async updateGoal(id: string, updates: Partial<GoalRecord>): Promise<GoalRecord | null> {
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
      return this.findGoalById(id);
    }

    params.push(id);

    const result = await query<GoalRow>(
      `
        UPDATE goals
        SET ${assignments.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length}
        RETURNING *;
      `,
      params,
    );

    return result.rows[0] ? mapGoalRow(result.rows[0]) : null;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`DELETE FROM goals WHERE id = $1 RETURNING id;`, [id]);
    return result.rows.length > 0;
  }
}

export const goalRepository = new GoalRepository();
