import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/adapters/inbound/http/app.js';
import type { CreateAppOptions } from '../../src/adapters/inbound/http/app.js';
import { createAppDependencies } from '../../src/infrastructure/wiring/dependencies.js';
import type { PoolAdjustmentResult, RouteProps } from '../../src/core/domain/index.js';

interface RoutesResponse {
  routes: RouteProps[];
}

interface RouteResponse {
  route: RouteProps;
}

interface ComplianceResponse {
  routes: Array<Record<string, unknown>>;
}

interface BankResponse {
  routeId: string;
  newBankedTotal: number;
}

interface PoolResponse {
  poolId: string;
  entries: PoolAdjustmentResult[];
}

const createTestApp = async () => {
  const dependencies = await createAppDependencies({
    port: 3001,
    databaseUrl: '',
    persistenceDriver: 'memory',
    corsOrigin: '*',
  });

  const options: CreateAppOptions = {
    dependencies,
    corsOrigin: '*',
  };

  return createApp(options);
};

describe('API integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('GET /routes returns seeded routes', async () => {
    const response = await request(app).get('/routes');
    const body = response.body as RoutesResponse;

    expect(response.status).toBe(200);
    expect(body.routes).toHaveLength(5);
    expect(body.routes[0]?.id).toBe('route-1');
  });

  it('POST /routes/:id/baseline updates baseline', async () => {
    const response = await request(app).post('/routes/route-2/baseline').send({
      baselineIntensityGco2ePerMj: 86.5,
    });
    const body = response.body as RouteResponse;

    expect(response.status).toBe(200);
    expect(body.route.id).toBe('route-2');
    expect(body.route.baselineIntensityGco2ePerMj).toBe(86.5);
  });

  it('GET /compliance/cb computes compliance values', async () => {
    const response = await request(app).get('/compliance/cb');
    const body = response.body as ComplianceResponse;

    expect(response.status).toBe(200);
    expect(body.routes).toHaveLength(5);
    expect(body.routes[0]).toHaveProperty('complianceBalance');
    expect(body.routes[0]).toHaveProperty('percentDifferenceFromTarget');
  });

  it('POST /banking/bank banks positive surplus', async () => {
    const response = await request(app).post('/banking/bank').send({
      routeId: 'route-1',
      amountToBank: 1_000_000,
    });
    const body = response.body as BankResponse;

    expect(response.status).toBe(200);
    expect(body.routeId).toBe('route-1');
    expect(body.newBankedTotal).toBe(1_000_000);
  });

  it('POST /pools creates a valid pool', async () => {
    const response = await request(app).post('/pools').send({
      routeIds: ['route-1', 'route-2'],
    });
    const body = response.body as PoolResponse;

    expect(response.status).toBe(200);
    expect(body.poolId).toMatch(/^pool-/);
    expect(body.entries).toHaveLength(2);
  });
});
