import request from 'supertest';

import { createApp } from '../../src/adapters/inbound/http/app.js';
import { createAppDependencies } from '../../src/infrastructure/wiring/dependencies.js';

describe('GET /health', () => {
  it('returns service status', async () => {
    const dependencies = await createAppDependencies({
      port: 3001,
      databaseUrl: '',
      persistenceDriver: 'memory',
      corsOrigin: '*',
      logLevel: 'error',
      nodeEnv: 'test',
    });
    const app = createApp({ dependencies, corsOrigin: '*' });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
