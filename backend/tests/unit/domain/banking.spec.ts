import { describe, expect, it } from 'vitest';

import { applyBanked, bankSurplus, DomainValidationError } from '../../../src/core/domain/index.js';

describe('bankSurplus', () => {
  it('banks positive compliance balance', () => {
    const result = bankSurplus({
      currentBankedAmount: 1000,
      complianceBalance: 500,
    });

    expect(result.bankedAmount).toBe(500);
    expect(result.newBankedTotal).toBe(1500);
  });

  it('banks only the requested portion of surplus', () => {
    const result = bankSurplus({
      currentBankedAmount: 200,
      complianceBalance: 500,
      amountToBank: 120,
    });

    expect(result.bankedAmount).toBe(120);
    expect(result.newBankedTotal).toBe(320);
  });

  it('rejects invalid banking request', () => {
    expect(() =>
      bankSurplus({
        currentBankedAmount: 0,
        complianceBalance: -50,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      bankSurplus({
        currentBankedAmount: 0,
        complianceBalance: 50,
        amountToBank: 100,
      }),
    ).toThrowError(DomainValidationError);
  });
});

describe('applyBanked', () => {
  it('applies banked amount to reduce deficit', () => {
    const result = applyBanked({
      currentBankedAmount: 800,
      complianceBalance: -600,
      amountToApply: 250,
    });

    expect(result.appliedAmount).toBe(250);
    expect(result.remainingBankedAmount).toBe(550);
    expect(result.adjustedComplianceBalance).toBe(-350);
  });

  it('resolves deficit exactly to zero', () => {
    const result = applyBanked({
      currentBankedAmount: 300,
      complianceBalance: -300,
      amountToApply: 300,
    });

    expect(result.adjustedComplianceBalance).toBe(0);
    expect(result.remainingBankedAmount).toBe(0);
  });

  it('rejects applying more than banked or more than deficit', () => {
    expect(() =>
      applyBanked({
        currentBankedAmount: 100,
        complianceBalance: -400,
        amountToApply: 101,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      applyBanked({
        currentBankedAmount: 1000,
        complianceBalance: -400,
        amountToApply: 401,
      }),
    ).toThrowError(DomainValidationError);
  });
});

