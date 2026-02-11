import { DomainValidationError } from './errors/domain-validation-error.js';

export interface BankSurplusInput {
  currentBankedAmount: number;
  complianceBalance: number;
  amountToBank?: number;
}

export interface BankSurplusResult {
  bankedAmount: number;
  newBankedTotal: number;
}

export interface ApplyBankedInput {
  currentBankedAmount: number;
  complianceBalance: number;
  amountToApply: number;
}

export interface ApplyBankedResult {
  appliedAmount: number;
  remainingBankedAmount: number;
  adjustedComplianceBalance: number;
}

const validateNonNegativeNumber = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`${fieldName} must be a finite non-negative number`);
  }
};

export const bankSurplus = (input: BankSurplusInput): BankSurplusResult => {
  validateNonNegativeNumber(input.currentBankedAmount, 'Current banked amount');

  if (input.complianceBalance <= 0) {
    throw new DomainValidationError('Only positive compliance balance can be banked');
  }

  const amountToBank = input.amountToBank ?? input.complianceBalance;
  validateNonNegativeNumber(amountToBank, 'Amount to bank');

  if (amountToBank === 0) {
    throw new DomainValidationError('Amount to bank must be greater than zero');
  }

  if (amountToBank > input.complianceBalance) {
    throw new DomainValidationError('Cannot bank more than available surplus');
  }

  return {
    bankedAmount: amountToBank,
    newBankedTotal: input.currentBankedAmount + amountToBank,
  };
};

export const applyBanked = (input: ApplyBankedInput): ApplyBankedResult => {
  validateNonNegativeNumber(input.currentBankedAmount, 'Current banked amount');
  validateNonNegativeNumber(input.amountToApply, 'Amount to apply');

  if (input.amountToApply === 0) {
    throw new DomainValidationError('Amount to apply must be greater than zero');
  }

  if (input.complianceBalance >= 0) {
    throw new DomainValidationError('Banked amount can only be applied to a deficit');
  }

  if (input.amountToApply > input.currentBankedAmount) {
    throw new DomainValidationError('Cannot apply more than banked amount');
  }

  const deficitMagnitude = Math.abs(input.complianceBalance);
  if (input.amountToApply > deficitMagnitude) {
    throw new DomainValidationError('Cannot apply more than the existing deficit');
  }

  return {
    appliedAmount: input.amountToApply,
    remainingBankedAmount: input.currentBankedAmount - input.amountToApply,
    adjustedComplianceBalance: input.complianceBalance + input.amountToApply,
  };
};

