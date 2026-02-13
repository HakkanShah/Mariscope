import { describe, expect, it } from 'vitest';

import { ApplicationError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('ComputeComparisonUseCase', () => {
  it('computes comparison rows against baseline', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.computeComparison.execute({ year: 2024 });

    expect(result.baseline.routeId).toBe('R001');
    expect(result.comparisons).toHaveLength(2);
    expect(result.comparisons[0]).toHaveProperty('percentDiff');
  });

  it('throws when no baseline exists for selected scope', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.computeComparison.execute({ year: 2030 }),
    ).rejects.toThrowError(ApplicationError);
  });
});
