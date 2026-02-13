import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/adapters/inbound/http/app.js';
import type { CreateAppOptions } from '../../src/adapters/inbound/http/app.js';
import { createAppDependencies } from '../../src/infrastructure/wiring/dependencies.js';
import type { RouteProps } from '../../src/core/domain/index.js';

interface RoutesResponse {
  routes: RouteProps[];
}

interface RouteResponse {
  route: RouteProps;
}

interface ComparisonResponse {
  baseline: {
    routeId: string;
    year: number;
    ghgIntensityGco2ePerMj: number;
  };
  comparisons: Array<{
    routeId: string;
    percentDiff: number;
    compliant: boolean;
  }>;
}

interface ComplianceResponse {
  records: Array<{
    shipId: string;
    year: number;
    cb: number;
  }>;
}

interface BankResponse {
  shipId: string;
  newBankedTotal: number;
}

interface ApplyResponse {
  shipId: string;
  applied: number;
}

interface BankingRecordsResponse {
  records: Array<{ id: string }>;
  currentBankedAmount: number;
}

interface AdjustedResponse {
  records: Array<{
    shipId: string;
    adjustedCb: number;
  }>;
}

interface PoolResponse {
  poolId: string;
  entries: Array<{ shipId: string }>;
}

const createTestApp = async () => {
  const dependencies = await createAppDependencies({
    port: 3001,
    databaseUrl: '',
    persistenceDriver: 'memory',
    corsOrigin: '*',
    logLevel: 'error',
    nodeEnv: 'test',
  });

  const options: CreateAppOptions = {
    dependencies,
    corsOrigin: '*',
  };

  return {
    app: createApp(options),
    dependencies,
  };
};

describe('API integration', () => {
  let app: ReturnType<typeof createApp>;
  let dependencies: Awaited<ReturnType<typeof createAppDependencies>>;

  beforeEach(async () => {
    const created = await createTestApp();
    app = created.app;
    dependencies = created.dependencies;
  });

  it('GET /routes returns seeded routes', async () => {
    const response = await request(app).get('/routes');
    const body = response.body as RoutesResponse;

    expect(response.status).toBe(200);
    expect(body.routes).toHaveLength(5);
    expect(body.routes[0]?.id).toBe('R001');
    expect(body.routes[0]?.vesselType).toBe('Container');
  });

  it('GET /routes supports filters', async () => {
    const response = await request(app).get('/routes').query({ fuelType: 'LNG', year: 2025 });
    const body = response.body as RoutesResponse;

    expect(response.status).toBe(200);
    expect(body.routes).toHaveLength(1);
    expect(body.routes[0]?.id).toBe('R005');
  });

  it('POST /routes/:id/baseline updates baseline', async () => {
    const response = await request(app).post('/routes/R002/baseline').send({});
    const body = response.body as RouteResponse;

    expect(response.status).toBe(200);
    expect(body.route.id).toBe('R002');
    expect(body.route.isBaseline).toBe(true);
  });

  it('GET /routes/comparison returns baseline comparison rows', async () => {
    const response = await request(app).get('/routes/comparison').query({ year: 2024 });
    const body = response.body as ComparisonResponse;

    expect(response.status).toBe(200);
    expect(body.baseline.routeId).toBe('R001');
    expect(body.comparisons).toHaveLength(2);
    expect(body.comparisons[0]).toHaveProperty('percentDiff');
  });

  it('GET /compliance/cb computes compliance values', async () => {
    const response = await request(app).get('/compliance/cb').query({ year: 2024 });
    const body = response.body as ComplianceResponse;

    expect(response.status).toBe(200);
    expect(body.records).toHaveLength(3);
    expect(body.records[0]).toHaveProperty('cb');
  });

  it('POST /banking/bank banks positive surplus', async () => {
    const response = await request(app).post('/banking/bank').send({
      shipId: 'R002',
      amountToBank: 1_000_000,
    });
    const body = response.body as BankResponse;

    expect(response.status).toBe(200);
    expect(body.shipId).toBe('R002');
    expect(body.newBankedTotal).toBe(1_000_000);
  });

  it('POST /banking/apply applies banked amount to a deficit', async () => {
    await dependencies.bankRepository.saveRecord({
      shipId: 'R003',
      year: 2024,
      entryType: 'bank',
      amount: 1_000_000,
    });

    const response = await request(app).post('/banking/apply').send({
      shipId: 'R003',
      amountToApply: 500_000,
    });
    const body = response.body as ApplyResponse;

    expect(response.status).toBe(200);
    expect(body.shipId).toBe('R003');
    expect(body.applied).toBe(500_000);
  });

  it('GET /banking/records returns records', async () => {
    await request(app).post('/banking/bank').send({
      shipId: 'R002',
      amountToBank: 100,
    });

    const response = await request(app).get('/banking/records').query({ shipId: 'R002', year: 2024 });
    const body = response.body as BankingRecordsResponse;

    expect(response.status).toBe(200);
    expect(body.records).toHaveLength(1);
    expect(body.currentBankedAmount).toBe(100);
  });

  it('GET /compliance/adjusted-cb returns adjusted records', async () => {
    await dependencies.bankRepository.saveRecord({
      shipId: 'R003',
      year: 2024,
      entryType: 'apply',
      amount: 250_000,
    });

    const response = await request(app).get('/compliance/adjusted-cb').query({ year: 2024 });
    const body = response.body as AdjustedResponse;

    expect(response.status).toBe(200);
    expect(body.records).toHaveLength(3);
    expect(body.records[0]).toHaveProperty('adjustedCb');
  });

  it('POST /pools creates a valid pool', async () => {
    const response = await request(app).post('/pools').send({
      year: 2024,
      shipIds: ['R002'],
    });
    const body = response.body as PoolResponse;

    expect(response.status).toBe(200);
    expect(body.poolId).toMatch(/^pool-/);
    expect(body.entries).toHaveLength(1);
  });
});
