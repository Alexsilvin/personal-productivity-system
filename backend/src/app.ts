import Fastify from 'fastify';
import { z } from 'zod';
import { AppError } from './common/errors.js';
import { config } from './config.js';
import taskRoutes from './modules/tasks/task.routes.js';

export function createApp() {
  const app = Fastify({
    logger: config.NODE_ENV !== 'test',
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      });
    }

    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.') || 'request',
            message: issue.message,
          })),
        },
      });
    }

    if (typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number') {
      return reply.code(error.statusCode).send({
        error: {
          code: 'HTTP_ERROR',
          message: 'Request failed',
        },
      });
    }

    app.log.error({ err: error }, 'Unhandled application error');
    return reply.code(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'personal-productivity-system',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  }));

  app.register(taskRoutes, { prefix: '/tasks' });

  return app;
}

export const app = createApp();
