import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('SetBaselineUseCase', () => {
  it('marks selected route as baseline and clears same-year peers', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.setBaseline.execute({
      routeId: 'R002',
    });

    expect(result.id).toBe('R002');
    expect(result.isBaseline).toBe(true);

    const sameYear = await context.useCases.getRoutes.execute({ year: 2024 });
    expect(sameYear.filter((route) => route.isBaseline)).toHaveLength(1);
  });

  it('throws when route does not exist', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.setBaseline.execute({
        routeId: 'missing-route',
      }),
    ).rejects.toThrowError(NotFoundError);
  });
});
