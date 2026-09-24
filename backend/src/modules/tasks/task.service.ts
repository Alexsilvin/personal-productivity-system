import { AppError } from '../../common/errors.js';
import type { TaskRecord } from '../domain.js';
import type { CreateTaskInput, UpdateTaskInput } from './task.schemas.js';
import { taskRepository, type TaskListFilters } from './task.repository.js';

export class TaskService {
  constructor(private readonly repository = taskRepository) {}

  async createTask(input: CreateTaskInput): Promise<TaskRecord> {
    await this.assertValidReferences(input.userId, input.projectId, input.courseId, input.goalId);

    if (input.minimumDurationMinutes > input.estimatedDurationMinutes) {
      throw new AppError(
        'INVALID_TASK_DURATION',
        'minimumDurationMinutes cannot be greater than estimatedDurationMinutes',
        400,
      );
    }

    const task = await this.repository.createTask({
      userId: input.userId,
      projectId: input.projectId ?? null,
      courseId: input.courseId ?? null,
      goalId: input.goalId ?? null,
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      minimumDurationMinutes: input.minimumDurationMinutes,
      dueAt: input.dueAt ?? null,
      completedAt: input.completedAt ?? null,
    });

    return task;
  }

  async getTaskById(id: string): Promise<TaskRecord> {
    const task = await this.repository.findTaskById(id);

    if (!task) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }

    return task;
  }

  async listTasks(filters: TaskListFilters, limit: number, offset: number): Promise<{ items: TaskRecord[]; total: number }> {
    return this.repository.listTasks(filters, limit, offset);
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<TaskRecord> {
    const existingTask = await this.repository.findTaskById(id);

    if (!existingTask) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }

    const nextUserId = existingTask.userId;
    const nextProjectId = input.projectId ?? existingTask.projectId;
    const nextCourseId = input.courseId ?? existingTask.courseId;
    const nextGoalId = input.goalId ?? existingTask.goalId;

    await this.assertValidReferences(nextUserId, nextProjectId, nextCourseId, nextGoalId);

    const estimatedDurationMinutes = input.estimatedDurationMinutes ?? existingTask.estimatedDurationMinutes;
    const minimumDurationMinutes = input.minimumDurationMinutes ?? existingTask.minimumDurationMinutes;

    if (minimumDurationMinutes > estimatedDurationMinutes) {
      throw new AppError(
        'INVALID_TASK_DURATION',
        'minimumDurationMinutes cannot be greater than estimatedDurationMinutes',
        400,
      );
    }

    const updatedTask = await this.repository.updateTask(id, {
      projectId: nextProjectId,
      courseId: nextCourseId,
      goalId: nextGoalId,
      title: input.title?.trim() ?? existingTask.title,
      description: input.description ?? existingTask.description,
      status: input.status ?? existingTask.status,
      priority: input.priority ?? existingTask.priority,
      estimatedDurationMinutes,
      minimumDurationMinutes,
      dueAt: input.dueAt ?? existingTask.dueAt,
      completedAt: input.completedAt ?? existingTask.completedAt,
    });

    if (!updatedTask) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await this.repository.deleteTask(id);

    if (!deleted) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }
  }

  private async assertValidReferences(
    userId: string,
    projectId: string | null | undefined,
    courseId: string | null | undefined,
    goalId: string | null | undefined,
  ): Promise<void> {
    const userExists = await this.repository.findUserById(userId);
    if (!userExists) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    if (projectId) {
      const projectExists = await this.repository.findProjectById(projectId);
      if (!projectExists) {
        throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
      }
    }

    if (courseId) {
      const courseExists = await this.repository.findCourseById(courseId);
      if (!courseExists) {
        throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
      }
    }

    if (goalId) {
      const goalExists = await this.repository.findGoalById(goalId);
      if (!goalExists) {
        throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
      }
    }
  }
}

export const taskService = new TaskService();
