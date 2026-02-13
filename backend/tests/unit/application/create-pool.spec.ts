import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('CreatePoolUseCase', () => {
  it('creates a pool when total selected adjusted compliance is non-negative', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.createPool.execute({
      year: 2024,
      shipIds: ['R002'],
    });

    expect(result.poolId).toMatch(/^pool-/);
    expect(result.entries).toHaveLength(1);
  });

  it('rejects pool creation when selected total adjusted compliance is negative', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.createPool.execute({
        year: 2025,
        shipIds: ['R004', 'R005'],
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});
