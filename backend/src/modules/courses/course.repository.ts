import { query } from '../../infrastructure/database/client.js';
import type { CourseRecord, CourseStatus } from '../domain.js';

export interface CourseListFilters {
  userId?: string;
  status?: CourseStatus;
}

interface CourseRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

function mapCourseRow(row: CourseRow): CourseRecord {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class CourseRepository {
  async createCourse(input: Omit<CourseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseRecord> {
    const result = await query<CourseRow>(
      `
        INSERT INTO courses (user_id, title, description, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      [input.userId, input.title, input.description, input.status],
    );

    return mapCourseRow(result.rows[0]);
  }

  async findCourseById(id: string): Promise<CourseRecord | null> {
    const result = await query<CourseRow>(`SELECT * FROM courses WHERE id = $1;`, [id]);
    return result.rows[0] ? mapCourseRow(result.rows[0]) : null;
  }

  async findUserById(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`SELECT id FROM users WHERE id = $1;`, [id]);
    return result.rows.length > 0;
  }

  async listCourses(filters: CourseListFilters, limit: number, offset: number): Promise<{ items: CourseRecord[]; total: number }> {
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM courses ${whereClause};`, params);
    const dataResult = await query<CourseRow>(
      `
        SELECT *
        FROM courses
        ${whereClause}
        ORDER BY created_at DESC, id
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2};
      `,
      [...params, limit, offset],
    );

    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: dataResult.rows.map(mapCourseRow),
    };
  }

  async updateCourse(id: string, updates: Partial<CourseRecord>): Promise<CourseRecord | null> {
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
      return this.findCourseById(id);
    }

    params.push(id);

    const result = await query<CourseRow>(
      `
        UPDATE courses
        SET ${assignments.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length}
        RETURNING *;
      `,
      params,
    );

    return result.rows[0] ? mapCourseRow(result.rows[0]) : null;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await query<{ id: string }>(`DELETE FROM courses WHERE id = $1 RETURNING id;`, [id]);
    return result.rows.length > 0;
  }
}

export const courseRepository = new CourseRepository();
