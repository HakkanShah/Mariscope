import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('BankSurplusUseCase', () => {
  it('banks a portion of route surplus', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.bankSurplus.execute({
      routeId: 'route-1',
      amountToBank: 500_000,
    });

    expect(result.routeId).toBe('route-1');
    expect(result.bankedAmount).toBe(500_000);
    expect(result.newBankedTotal).toBe(500_000);
  });

  it('rejects banking for deficit route', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.bankSurplus.execute({
        routeId: 'route-3',
        amountToBank: 1,
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});

