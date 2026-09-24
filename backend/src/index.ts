import Fastify from 'fastify';
import { config } from './config.js';

const app = Fastify({
  logger: config.NODE_ENV !== 'test',
});

app.get('/health', async () => ({
  ok: true,
  service: 'personal-productivity-system',
  environment: config.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

export async function startServer() {
  await app.listen({ host: '0.0.0.0', port: config.PORT });
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
}

export { app };
