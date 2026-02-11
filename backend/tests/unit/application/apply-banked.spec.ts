import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('ApplyBankedUseCase', () => {
  it('applies banked surplus to a deficit route', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.setBankedAmount('route-2', 2_000_000);

    const result = await context.useCases.applyBanked.execute({
      routeId: 'route-2',
      amountToApply: 1_000_000,
    });

    expect(result.routeId).toBe('route-2');
    expect(result.adjustedComplianceBalance).toBeGreaterThan(result.complianceBalance);
    expect(result.remainingBankedAmount).toBe(1_000_000);
  });

  it('rejects apply when amount exceeds banked value', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.setBankedAmount('route-2', 100);

    await expect(
      context.useCases.applyBanked.execute({
        routeId: 'route-2',
        amountToApply: 101,
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});

