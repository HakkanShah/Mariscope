import { TARGET_INTENSITY_2025 } from './constants.js';
import { DomainValidationError } from './errors/domain-validation-error.js';

export interface ComparisonInput {
  baselineIntensityGco2ePerMj: number;
  comparisonIntensityGco2ePerMj: number;
}

export interface ComparisonResult {
  baselineIntensityGco2ePerMj: number;
  comparisonIntensityGco2ePerMj: number;
  percentDiff: number;
  compliant: boolean;
}

const validatePositive = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainValidationError(`${fieldName} must be a finite positive number`);
  }
};

export const computeComparison = (input: ComparisonInput): ComparisonResult => {
  validatePositive(input.baselineIntensityGco2ePerMj, 'Baseline intensity');
  validatePositive(input.comparisonIntensityGco2ePerMj, 'Comparison intensity');

  const percentDiff =
    ((input.comparisonIntensityGco2ePerMj / input.baselineIntensityGco2ePerMj) - 1) * 100;

  return {
    baselineIntensityGco2ePerMj: input.baselineIntensityGco2ePerMj,
    comparisonIntensityGco2ePerMj: input.comparisonIntensityGco2ePerMj,
    percentDiff,
    compliant: input.comparisonIntensityGco2ePerMj <= TARGET_INTENSITY_2025,
  };
};
