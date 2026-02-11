import { describe, expect, it } from 'vitest';

import {
  ComplianceBalance,
  DomainValidationError,
  TARGET_INTENSITY_2025,
} from '../../../src/core/domain/index.js';

describe('ComplianceBalance', () => {
  it('computes positive compliance balance from target and actual intensity', () => {
    const result = ComplianceBalance.calculate({
      actualIntensityGco2ePerMj: 85,
      fuelConsumptionTonnes: 10,
    });

    expect(result.targetIntensityGco2ePerMj).toBe(TARGET_INTENSITY_2025);
    expect(result.energyInScopeMj).toBe(410_000);
    expect(result.complianceBalance).toBeCloseTo((89.3368 - 85) * 410_000, 6);
    expect(ComplianceBalance.isSurplus(result.complianceBalance)).toBe(true);
  });

  it('computes deficit and percent difference from target', () => {
    const result = ComplianceBalance.calculate({
      targetIntensityGco2ePerMj: 89.3368,
      actualIntensityGco2ePerMj: 92,
      fuelConsumptionTonnes: 20,
    });

    expect(result.complianceBalance).toBeCloseTo((89.3368 - 92) * 820_000, 6);
    expect(result.percentDifferenceFromTarget).toBeCloseTo(((92 - 89.3368) / 89.3368) * 100, 6);
    expect(ComplianceBalance.isDeficit(result.complianceBalance)).toBe(true);
  });

  it('rejects invalid numeric input', () => {
    expect(() =>
      ComplianceBalance.calculate({
        targetIntensityGco2ePerMj: 0,
        actualIntensityGco2ePerMj: 90,
        fuelConsumptionTonnes: 10,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      ComplianceBalance.calculate({
        actualIntensityGco2ePerMj: -1,
        fuelConsumptionTonnes: 10,
      }),
    ).toThrowError(DomainValidationError);
  });
});

