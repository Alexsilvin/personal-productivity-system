import { AppError } from '../../common/errors.js';
import type { ProjectRecord } from '../domain.js';
import type { CreateProjectInput, UpdateProjectInput } from './project.schemas.js';
import { projectRepository, type ProjectListFilters } from './project.repository.js';

export class ProjectService {
  constructor(private readonly repository = projectRepository) {}

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const userExists = await this.repository.findUserById(input.userId);
    if (!userExists) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    if (input.goalId) {
      const goalExists = await this.repository.findGoalForUser(input.goalId, input.userId);
      if (!goalExists) {
        throw new AppError('GOAL_OWNERSHIP_MISMATCH', 'Goal does not belong to this user', 409);
      }
    }

    const project = await this.repository.createProject({
      userId: input.userId,
      goalId: input.goalId ?? null,
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
    });

    return project;
  }

  async getProjectById(id: string, userId: string): Promise<ProjectRecord> {
    const project = await this.repository.findProjectById(id);
    if (!project || project.userId !== userId) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }
    return project;
  }

  async listProjects(filters: ProjectListFilters, limit: number, offset: number): Promise<{ items: ProjectRecord[]; total: number }> {
    return this.repository.listProjects(filters, limit, offset);
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput): Promise<ProjectRecord> {
    const existingProject = await this.repository.findProjectById(id);
    if (!existingProject) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }
    if (existingProject.userId !== userId) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }

    if (input.goalId !== undefined && input.goalId !== null) {
      const goalExists = await this.repository.findGoalForUser(input.goalId, userId);
      if (!goalExists) {
        throw new AppError('GOAL_OWNERSHIP_MISMATCH', 'Goal does not belong to this user', 409);
      }
    }

    const updatedProject = await this.repository.updateProject(id, {
      goalId: input.goalId !== undefined ? input.goalId : existingProject.goalId,
      title: input.title !== undefined ? input.title.trim() : existingProject.title,
      description: input.description !== undefined ? input.description : existingProject.description,
      status: input.status !== undefined ? input.status : existingProject.status,
      priority: input.priority !== undefined ? input.priority : existingProject.priority,
    });

    if (!updatedProject) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }

    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const existingProject = await this.repository.findProjectById(id);
    if (!existingProject) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }
    if (existingProject.userId !== userId) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }

    const deleted = await this.repository.deleteProject(id);
    if (!deleted) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404);
    }
  }
}

export const projectService = new ProjectService();
