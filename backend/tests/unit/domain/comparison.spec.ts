import { describe, expect, it } from 'vitest';

import { computeComparison, DomainValidationError } from '../../../src/core/domain/index.js';

describe('computeComparison', () => {
  it('computes percent difference from baseline intensity', () => {
    const result = computeComparison({
      baselineIntensityGco2ePerMj: 91,
      comparisonIntensityGco2ePerMj: 88,
    });

    expect(result.percentDiff).toBeCloseTo(((88 / 91) - 1) * 100, 6);
    expect(result.compliant).toBe(true);
  });

  it('marks non-compliant route above target intensity', () => {
    const result = computeComparison({
      baselineIntensityGco2ePerMj: 91,
      comparisonIntensityGco2ePerMj: 93,
    });

    expect(result.compliant).toBe(false);
  });

  it('rejects non-positive baseline', () => {
    expect(() =>
      computeComparison({
        baselineIntensityGco2ePerMj: 0,
        comparisonIntensityGco2ePerMj: 91,
      }),
    ).toThrowError(DomainValidationError);
  });
});
