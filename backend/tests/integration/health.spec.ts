import request from 'supertest';

import { createApp } from '../../src/adapters/inbound/http/app.js';

describe('GET /health', () => {
  it('returns service status', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

