import type { FastifyPluginAsync } from 'fastify';
import { AppError, buildValidationErrorDetails } from '../../common/errors.js';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  projectUserScopeQuerySchema,
  updateProjectSchema,
} from './project.schemas.js';
import { projectService } from './project.service.js';

const projectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const parsedBody = createProjectSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const project = await projectService.createProject(parsedBody.data);
    return reply.code(201).send(project);
  });

  fastify.get('/', async (request, reply) => {
    const parsedQuery = listProjectsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Project query parameters are invalid',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const result = await projectService.listProjects(
      {
        userId: parsedQuery.data.userId,
        goalId: parsedQuery.data.goalId,
        status: parsedQuery.data.status,
        priority: parsedQuery.data.priority,
      },
      parsedQuery.data.limit,
      parsedQuery.data.offset,
    );

    return reply.code(200).send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const parsedParams = projectIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Project id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedQuery = projectUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const project = await projectService.getProjectById(parsedParams.data.id, parsedQuery.data.user_id);
    return reply.code(200).send(project);
  });

  fastify.patch('/:id', async (request, reply) => {
    const parsedParams = projectIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Project id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedBody = updateProjectSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const parsedQuery = projectUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const project = await projectService.updateProject(parsedParams.data.id, parsedQuery.data.user_id, parsedBody.data);
    return reply.code(200).send(project);
  });

  fastify.delete('/:id', async (request, reply) => {
    const parsedParams = projectIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Project id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedQuery = projectUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    await projectService.deleteProject(parsedParams.data.id, parsedQuery.data.user_id);
    return reply.code(204).send();
  });
};

export default projectRoutes;
