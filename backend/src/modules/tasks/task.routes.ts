import type { FastifyPluginAsync } from 'fastify';
import { AppError, buildValidationErrorDetails } from '../../common/errors.js';
import { createTaskSchema, listTasksQuerySchema, taskIdParamSchema, updateTaskSchema } from './task.schemas.js';
import { taskService } from './task.service.js';

const taskRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const parsedBody = createTaskSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const task = await taskService.createTask(parsedBody.data);
    return reply.code(201).send(task);
  });

  fastify.get('/:id', async (request, reply) => {
    const parsedParams = taskIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Task id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const task = await taskService.getTaskById(parsedParams.data.id);
    return reply.code(200).send(task);
  });

  fastify.get('/', async (request, reply) => {
    const parsedQuery = listTasksQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Task query parameters are invalid',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const taskPage = await taskService.listTasks(
      {
        userId: parsedQuery.data.userId,
        status: parsedQuery.data.status,
        priority: parsedQuery.data.priority,
        projectId: parsedQuery.data.projectId,
        courseId: parsedQuery.data.courseId,
        goalId: parsedQuery.data.goalId,
      },
      parsedQuery.data.limit,
      parsedQuery.data.offset,
    );

    return reply.code(200).send(taskPage);
  });

  fastify.patch('/:id', async (request, reply) => {
    const parsedParams = taskIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Task id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedBody = updateTaskSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const task = await taskService.updateTask(parsedParams.data.id, parsedBody.data);
    return reply.code(200).send(task);
  });

  fastify.delete('/:id', async (request, reply) => {
    const parsedParams = taskIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Task id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    await taskService.deleteTask(parsedParams.data.id);
    return reply.code(204).send();
  });
};

export default taskRoutes;
