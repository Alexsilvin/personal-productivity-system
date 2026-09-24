import { startServer } from './server.js';
export { app, createApp } from './app.js';
export { startServer };

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
