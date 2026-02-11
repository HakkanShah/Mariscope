import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../../../src/core/application/errors/application-error.js';
import { createApplicationTestContext } from './test-context.js';

describe('SetBaselineUseCase', () => {
  it('sets baseline intensity for a route', async () => {
    const context = createApplicationTestContext();

    const result = await context.useCases.setBaseline.execute({
      routeId: 'route-2',
      baselineIntensityGco2ePerMj: 86.3,
    });

    expect(result.id).toBe('route-2');
    expect(result.baselineIntensityGco2ePerMj).toBe(86.3);
  });

  it('throws when route does not exist', async () => {
    const context = createApplicationTestContext();

    await expect(
      context.useCases.setBaseline.execute({
        routeId: 'missing-route',
        baselineIntensityGco2ePerMj: 86.3,
      }),
    ).rejects.toThrowError(NotFoundError);
  });
});

