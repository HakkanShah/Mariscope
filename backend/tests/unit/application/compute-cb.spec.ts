import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('ComputeCBUseCase', () => {
  it('computes compliance balances for all routes', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.computeCB.execute();

    expect(result).toHaveLength(6);
    expect(result[0]?.shipId).toBe('R001');
    expect(result[0]?.result).toHaveProperty('complianceBalance');
  });

  it('computes compliance for selected ship and year', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.computeCB.execute({
      shipId: 'R002',
      year: 2024,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.shipId).toBe('R002');
  });

  it('throws when requested ship does not exist', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.computeCB.execute({
        shipId: 'missing-route',
      }),
    ).rejects.toThrowError(NotFoundError);
  });
});
