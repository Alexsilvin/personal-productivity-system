import { describe, expect, it } from 'vitest';
import { app } from '../src/index.js';

describe('health endpoint', () => {
  it('returns the service health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      service: 'personal-productivity-system',
    });
  });
});
