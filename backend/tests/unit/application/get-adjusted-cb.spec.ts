import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('GetAdjustedCBUseCase', () => {
  it('returns adjusted cb with applied amount for a ship', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R003',
      year: 2024,
      entryType: 'apply',
      amount: 200_000,
    });

    const result = await context.useCases.getAdjustedCB.execute({ shipId: 'R003' });

    expect(result).toHaveLength(1);
    expect(result[0]?.applied).toBe(200_000);
    expect(result[0]?.adjustedCb).toBeCloseTo((result[0]?.cbBefore ?? 0) + 200_000, 6);
  });

  it('throws when ship does not exist', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.getAdjustedCB.execute({ shipId: 'missing-route' }),
    ).rejects.toThrowError(NotFoundError);
  });
});
