import { describe, expect, it } from 'vitest';

import { DomainValidationError, Route } from '../../../src/core/domain/index.js';

describe('Route', () => {
  it('creates a route and computes energy in scope', () => {
    const route = Route.create({
      id: 'route-1',
      name: 'North Sea Corridor',
      fuelConsumptionTonnes: 100,
      actualIntensityGco2ePerMj: 88.2,
    });

    expect(route.id).toBe('route-1');
    expect(route.name).toBe('North Sea Corridor');
    expect(route.energyInScopeMj()).toBe(4_100_000);
  });

  it('adds a baseline intensity through immutable update', () => {
    const route = Route.create({
      id: 'route-2',
      name: 'Baltic Link',
      fuelConsumptionTonnes: 60,
      actualIntensityGco2ePerMj: 90.5,
    });

    const updated = route.withBaselineIntensity(87.25);

    expect(route.baselineIntensityGco2ePerMj).toBeNull();
    expect(updated.baselineIntensityGco2ePerMj).toBe(87.25);
  });

  it('rejects invalid route payload', () => {
    expect(() =>
      Route.create({
        id: 'route-3',
        name: '  ',
        fuelConsumptionTonnes: 10,
        actualIntensityGco2ePerMj: 90,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      Route.create({
        id: 'route-4',
        name: 'Atlantic Crossing',
        fuelConsumptionTonnes: -1,
        actualIntensityGco2ePerMj: 90,
      }),
    ).toThrowError(DomainValidationError);
  });
});

