import {
  FLOATING_POINT_TOLERANCE,
  TARGET_INTENSITY_2025,
} from './constants.js';
import { DomainValidationError } from './errors/domain-validation-error.js';
import type { Route } from './route.js';

export interface ComplianceBalanceInput {
  targetIntensityGco2ePerMj?: number;
  actualIntensityGco2ePerMj: number;
  fuelConsumptionTonnes: number;
}

export interface ComplianceBalanceResult {
  targetIntensityGco2ePerMj: number;
  actualIntensityGco2ePerMj: number;
  fuelConsumptionTonnes: number;
  energyInScopeMj: number;
  complianceBalance: number;
}

const validatePositiveNumber = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainValidationError(`${fieldName} must be a finite positive number`);
  }
};

const validateNonNegativeNumber = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`${fieldName} must be a finite non-negative number`);
  }
};

export class ComplianceBalance {
  public static calculate(input: ComplianceBalanceInput): ComplianceBalanceResult {
    const targetIntensity = input.targetIntensityGco2ePerMj ?? TARGET_INTENSITY_2025;

    validatePositiveNumber(targetIntensity, 'Target intensity');
    validateNonNegativeNumber(input.actualIntensityGco2ePerMj, 'Actual intensity');
    validateNonNegativeNumber(input.fuelConsumptionTonnes, 'Fuel consumption');

    const energyInScopeMj = input.fuelConsumptionTonnes * 41000;
    const complianceBalance = (targetIntensity - input.actualIntensityGco2ePerMj) * energyInScopeMj;

    return {
      targetIntensityGco2ePerMj: targetIntensity,
      actualIntensityGco2ePerMj: input.actualIntensityGco2ePerMj,
      fuelConsumptionTonnes: input.fuelConsumptionTonnes,
      energyInScopeMj,
      complianceBalance,
    };
  }

  public static fromRoute(route: Route, targetIntensityGco2ePerMj?: number): ComplianceBalanceResult {
    const input: ComplianceBalanceInput = {
      actualIntensityGco2ePerMj: route.ghgIntensityGco2ePerMj,
      fuelConsumptionTonnes: route.fuelConsumptionTonnes,
    };

    if (targetIntensityGco2ePerMj !== undefined) {
      input.targetIntensityGco2ePerMj = targetIntensityGco2ePerMj;
    }

    return ComplianceBalance.calculate(input);
  }

  public static isSurplus(complianceBalance: number): boolean {
    return complianceBalance > FLOATING_POINT_TOLERANCE;
  }

  public static isDeficit(complianceBalance: number): boolean {
    return complianceBalance < -FLOATING_POINT_TOLERANCE;
  }
}
