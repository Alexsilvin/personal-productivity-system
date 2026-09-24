import type { FastifyPluginAsync } from 'fastify';
import { AppError, buildValidationErrorDetails } from '../../common/errors.js';
import {
  createGoalSchema,
  goalIdParamSchema,
  goalUserScopeQuerySchema,
  listGoalsQuerySchema,
  updateGoalSchema,
} from './goal.schemas.js';
import { goalService } from './goal.service.js';

const goalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const parsedBody = createGoalSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const goal = await goalService.createGoal(parsedBody.data);
    return reply.code(201).send(goal);
  });

  fastify.get('/', async (request, reply) => {
    const parsedQuery = listGoalsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Goal query parameters are invalid',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const result = await goalService.listGoals(
      {
        userId: parsedQuery.data.userId,
        status: parsedQuery.data.status,
        priority: parsedQuery.data.priority,
      },
      parsedQuery.data.limit,
      parsedQuery.data.offset,
    );

    return reply.code(200).send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const parsedParams = goalIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Goal id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedQuery = goalUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const goal = await goalService.getGoalById(parsedParams.data.id, parsedQuery.data.user_id);
    return reply.code(200).send(goal);
  });

  fastify.patch('/:id', async (request, reply) => {
    const parsedParams = goalIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Goal id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedBody = updateGoalSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const parsedQuery = goalUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const goal = await goalService.updateGoal(parsedParams.data.id, parsedQuery.data.user_id, parsedBody.data);
    return reply.code(200).send(goal);
  });

  fastify.delete('/:id', async (request, reply) => {
    const parsedParams = goalIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Goal id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedQuery = goalUserScopeQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'user_id is required',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    await goalService.deleteGoal(parsedParams.data.id, parsedQuery.data.user_id);
    return reply.code(204).send();
  });
};

export default goalRoutes;
