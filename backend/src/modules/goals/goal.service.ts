import { AppError } from '../../common/errors.js';
import type { GoalRecord } from '../domain.js';
import type { CreateGoalInput, UpdateGoalInput } from './goal.schemas.js';
import { goalRepository, type GoalListFilters } from './goal.repository.js';

export class GoalService {
  constructor(private readonly repository = goalRepository) {}

  async createGoal(input: CreateGoalInput): Promise<GoalRecord> {
    const userExists = await this.repository.findUserById(input.userId);
    if (!userExists) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const goal = await this.repository.createGoal({
      userId: input.userId,
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      targetDate: input.targetDate ?? null,
    });

    return goal;
  }

  async getGoalById(id: string, userId: string): Promise<GoalRecord> {
    const goal = await this.repository.findGoalById(id);
    if (!goal || goal.userId !== userId) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }
    return goal;
  }

  async listGoals(filters: GoalListFilters, limit: number, offset: number): Promise<{ items: GoalRecord[]; total: number }> {
    return this.repository.listGoals(filters, limit, offset);
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput): Promise<GoalRecord> {
    const existingGoal = await this.repository.findGoalById(id);
    if (!existingGoal) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }
    if (existingGoal.userId !== userId) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }

    const updatedGoal = await this.repository.updateGoal(id, {
      title: input.title !== undefined ? input.title.trim() : existingGoal.title,
      description: input.description !== undefined ? input.description : existingGoal.description,
      status: input.status !== undefined ? input.status : existingGoal.status,
      priority: input.priority !== undefined ? input.priority : existingGoal.priority,
      targetDate: input.targetDate !== undefined ? input.targetDate : existingGoal.targetDate,
    });

    if (!updatedGoal) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }

    return updatedGoal;
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    const existingGoal = await this.repository.findGoalById(id);
    if (!existingGoal) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }
    if (existingGoal.userId !== userId) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }

    const deleted = await this.repository.deleteGoal(id);
    if (!deleted) {
      throw new AppError('GOAL_NOT_FOUND', 'Goal not found', 404);
    }
  }
}

export const goalService = new GoalService();
