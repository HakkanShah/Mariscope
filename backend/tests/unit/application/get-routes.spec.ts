import { describe, expect, it } from 'vitest';

import { GetRoutesUseCase } from '../../../src/core/application/get-routes.js';
import { Route } from '../../../src/core/domain/route.js';
import { InMemoryRouteRepository } from '../../../src/adapters/outbound/memory/in-memory-route-repository.js';
import { createApplicationTestContext } from './test-context.js';

describe('GetRoutesUseCase', () => {
  it('returns all available routes', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.getRoutes.execute();

    expect(result).toHaveLength(5);
    expect(result[0]?.id).toBe('R001');
  });

  it('filters by year', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.getRoutes.execute({ year: 2025 });

    expect(result).toHaveLength(2);
    expect(result.every((route) => route.year === 2025)).toBe(true);
  });

  it('returns serializable route primitives', async () => {
    const repository = new InMemoryRouteRepository([
      Route.create({
        id: 'RX01',
        vesselType: 'Container',
        fuelType: 'LNG',
        year: 2026,
        ghgIntensityGco2ePerMj: 87,
        fuelConsumptionTonnes: 100,
        distanceKm: 1000,
        totalEmissionsTonnes: 80,
        isBaseline: false,
      }),
    ]);
    const useCase = new GetRoutesUseCase(repository);

    const result = await useCase.execute();

    expect(result[0]).toEqual({
      id: 'RX01',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2026,
      ghgIntensityGco2ePerMj: 87,
      fuelConsumptionTonnes: 100,
      distanceKm: 1000,
      totalEmissionsTonnes: 80,
      isBaseline: false,
    });
  });
});
