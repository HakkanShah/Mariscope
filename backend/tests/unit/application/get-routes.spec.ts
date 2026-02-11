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
    expect(result[0]?.id).toBe('route-1');
  });

  it('returns empty array when no routes are present', async () => {
    const useCase = new GetRoutesUseCase(new InMemoryRouteRepository([]));

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('returns serializable route primitives', async () => {
    const repository = new InMemoryRouteRepository([
      Route.create({
        id: 'custom-route',
        name: 'Custom',
        fuelConsumptionTonnes: 10,
        actualIntensityGco2ePerMj: 87,
      }),
    ]);
    const useCase = new GetRoutesUseCase(repository);

    const result = await useCase.execute();

    expect(result[0]).toEqual({
      id: 'custom-route',
      name: 'Custom',
      fuelConsumptionTonnes: 10,
      actualIntensityGco2ePerMj: 87,
      baselineIntensityGco2ePerMj: null,
    });
  });
});
