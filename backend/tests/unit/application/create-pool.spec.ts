import { describe, expect, it } from 'vitest';

import { DomainValidationError } from '../../../src/core/domain/errors/domain-validation-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('CreatePoolUseCase', () => {
  it('creates a pool when total selected compliance is non-negative', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.createPool.execute({
      routeIds: ['route-1', 'route-2'],
    });

    expect(result.poolId).toMatch(/^pool-/);
    expect(result.entries).toHaveLength(2);
  });

  it('rejects pool creation when selected total compliance is negative', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.createPool.execute({
        routeIds: ['route-2', 'route-3'],
      }),
    ).rejects.toThrowError(DomainValidationError);
  });
});

