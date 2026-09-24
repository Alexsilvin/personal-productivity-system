import type { FastifyPluginAsync } from 'fastify';
import { AppError, buildValidationErrorDetails } from '../../common/errors.js';
import { courseService } from './course.service.js';
import { courseIdParamSchema, createCourseSchema, listCoursesQuerySchema, updateCourseSchema } from './course.schemas.js';

const courseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const parsedBody = createCourseSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const course = await courseService.createCourse(parsedBody.data);
    return reply.code(201).send(course);
  });

  fastify.get('/', async (request, reply) => {
    const parsedQuery = listCoursesQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Course query parameters are invalid',
        400,
        buildValidationErrorDetails(parsedQuery.error.issues),
      );
    }

    const result = await courseService.listCourses(
      {
        userId: parsedQuery.data.userId,
        status: parsedQuery.data.status,
      },
      parsedQuery.data.limit,
      parsedQuery.data.offset,
    );

    return reply.code(200).send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const parsedParams = courseIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Course id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const query = request.query as { user_id?: string };
    const userId = typeof query.user_id === 'string' ? query.user_id : undefined;
    const course = await courseService.getCourseById(parsedParams.data.id, userId);
    return reply.code(200).send(course);
  });

  fastify.patch('/:id', async (request, reply) => {
    const parsedParams = courseIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Course id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const parsedBody = updateCourseSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Request validation failed',
        400,
        buildValidationErrorDetails(parsedBody.error.issues),
      );
    }

    const query = request.query as { user_id?: string };
    const userId = typeof query.user_id === 'string' ? query.user_id : undefined;

    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'user_id is required', 400);
    }

    const course = await courseService.updateCourse(parsedParams.data.id, userId, parsedBody.data);
    return reply.code(200).send(course);
  });

  fastify.delete('/:id', async (request, reply) => {
    const parsedParams = courseIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Course id is invalid',
        400,
        buildValidationErrorDetails(parsedParams.error.issues),
      );
    }

    const query = request.query as { user_id?: string };
    const userId = typeof query.user_id === 'string' ? query.user_id : undefined;

    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'user_id is required', 400);
    }

    await courseService.deleteCourse(parsedParams.data.id, userId);
    return reply.code(204).send();
  });
};

export default courseRoutes;
