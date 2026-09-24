import Fastify from 'fastify';
import { config } from './config.js';

export function createApp() {
  const app = Fastify({
    logger: config.NODE_ENV !== 'test',
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'personal-productivity-system',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  }));

  return app;
}

export const app = createApp();
