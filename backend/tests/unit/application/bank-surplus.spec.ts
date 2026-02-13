import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('BankSurplusUseCase', () => {
  it('banks a portion of route surplus', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.bankSurplus.execute({
      shipId: 'R002',
      amountToBank: 500_000,
    });

    expect(result.shipId).toBe('R002');
    expect(result.bankedAmount).toBe(500_000);
    expect(result.newBankedTotal).toBe(500_000);
  });

  it('rejects banking for deficit route', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.bankSurplus.execute({
        shipId: 'R003',
        amountToBank: 1,
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});
