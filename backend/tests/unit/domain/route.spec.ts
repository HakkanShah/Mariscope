import { describe, expect, it } from 'vitest';

import { DomainValidationError, Route } from '../../../src/core/domain/index.js';

describe('Route', () => {
  it('creates a route and computes energy in scope', () => {
    const route = Route.create({
      id: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensityGco2ePerMj: 91,
      fuelConsumptionTonnes: 5000,
      distanceKm: 12000,
      totalEmissionsTonnes: 4500,
      isBaseline: true,
    });

    expect(route.id).toBe('R001');
    expect(route.vesselType).toBe('Container');
    expect(route.energyInScopeMj()).toBe(205_000_000);
  });

  it('updates baseline flag through immutable update', () => {
    const route = Route.create({
      id: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensityGco2ePerMj: 88,
      fuelConsumptionTonnes: 4800,
      distanceKm: 11500,
      totalEmissionsTonnes: 4200,
      isBaseline: false,
    });

    const updated = route.withIsBaseline(true);

    expect(route.isBaseline).toBe(false);
    expect(updated.isBaseline).toBe(true);
  });

  it('rejects invalid route payload', () => {
    expect(() =>
      Route.create({
        id: ' ',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensityGco2ePerMj: 91,
        fuelConsumptionTonnes: 5000,
        distanceKm: 12000,
        totalEmissionsTonnes: 4500,
        isBaseline: false,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      Route.create({
        id: 'R003',
        vesselType: 'Tanker',
        fuelType: 'MGO',
        year: 2024,
        ghgIntensityGco2ePerMj: -1,
        fuelConsumptionTonnes: 5100,
        distanceKm: 12500,
        totalEmissionsTonnes: 4700,
        isBaseline: false,
      }),
    ).toThrowError(DomainValidationError);
  });
});
