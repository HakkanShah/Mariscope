import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('ApplyBankedUseCase', () => {
  it('applies banked surplus to a deficit route', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R003',
      year: 2024,
      entryType: 'bank',
      amount: 2_000_000,
    });

    const result = await context.useCases.applyBanked.execute({
      shipId: 'R003',
      amountToApply: 1_000_000,
    });

    expect(result.shipId).toBe('R003');
    expect(result.cbAfter).toBeGreaterThan(result.cbBefore);
    expect(result.remainingBankedAmount).toBe(1_000_000);
  });

  it('applies ledger balance banked by a different ship-year', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R002',
      year: 2024,
      entryType: 'bank',
      amount: 1_000_000,
    });

    const result = await context.useCases.applyBanked.execute({
      shipId: 'R003',
      amountToApply: 500_000,
    });

    expect(result.shipId).toBe('R003');
    expect(result.applied).toBe(500_000);
    expect(result.remainingBankedAmount).toBe(500_000);
  });

  it('rejects apply when amount exceeds banked value', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R003',
      year: 2024,
      entryType: 'bank',
      amount: 100,
    });

    await expect(
      context.useCases.applyBanked.execute({
        shipId: 'R003',
        amountToApply: 101,
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});
