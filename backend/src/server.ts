import { createApp } from './app.js';
import { config } from './config.js';

export async function startServer() {
  const app = createApp();
  await app.listen({ host: '0.0.0.0', port: config.PORT });
  return app;
}
