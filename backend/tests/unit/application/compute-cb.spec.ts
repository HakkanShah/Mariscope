import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('ComputeCBUseCase', () => {
  it('computes compliance balances for all routes', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.computeCB.execute();

    expect(result).toHaveLength(5);
    expect(result[0]?.routeId).toBe('route-1');
    expect(result[0]?.result).toHaveProperty('complianceBalance');
  });

  it('computes compliance for selected route IDs', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.computeCB.execute({
      routeIds: ['route-1', 'route-2'],
    });

    expect(result).toHaveLength(2);
    expect(result[1]?.routeId).toBe('route-2');
  });

  it('throws when a requested route ID does not exist', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.computeCB.execute({
        routeIds: ['route-1', 'missing-route'],
      }),
    ).rejects.toThrowError(NotFoundError);
  });
});
