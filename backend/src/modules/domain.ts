export type GoalStatus = 'draft' | 'active' | 'completed' | 'archived';
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type CourseStatus = 'draft' | 'active' | 'completed' | 'archived';
export type TaskStatus = 'draft' | 'queued' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type TaskPriority = 'critical' | 'important' | 'normal' | 'optional';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalRecord {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  priority: TaskPriority;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  goalId: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRecord {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  projectId: string | null;
  courseId: string | null;
  goalId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDurationMinutes: number;
  minimumDurationMinutes: number;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
