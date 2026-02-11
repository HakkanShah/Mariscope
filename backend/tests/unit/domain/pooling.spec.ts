import { describe, expect, it } from 'vitest';

import { createPool, DomainValidationError } from '../../../src/core/domain/index.js';

describe('createPool', () => {
  it('allocates surplus to deficits using greedy distribution', () => {
    const result = createPool([
      { shipId: 'S1', complianceBalance: 300 },
      { shipId: 'S2', complianceBalance: 120 },
      { shipId: 'D1', complianceBalance: -250 },
      { shipId: 'D2', complianceBalance: -100 },
    ]);

    const byId = new Map(result.map((row) => [row.shipId, row]));

    expect(byId.get('D1')?.cbAfter).toBe(0);
    expect(byId.get('D2')?.cbAfter).toBe(0);
    expect(byId.get('S1')?.cbAfter).toBe(0);
    expect(byId.get('S2')?.cbAfter).toBe(70);
  });

  it('uses multiple surplus contributors when one is exhausted', () => {
    const result = createPool([
      { shipId: 'S1', complianceBalance: 90 },
      { shipId: 'S2', complianceBalance: 70 },
      { shipId: 'D1', complianceBalance: -150 },
    ]);

    const byId = new Map(result.map((row) => [row.shipId, row]));

    expect(byId.get('D1')?.cbAfter).toBe(0);
    expect(byId.get('S1')?.cbAfter).toBe(0);
    expect(byId.get('S2')?.cbAfter).toBe(10);
  });

  it('rejects pool creation when total balance is negative', () => {
    expect(() =>
      createPool([
        { shipId: 'S1', complianceBalance: 50 },
        { shipId: 'D1', complianceBalance: -200 },
      ]),
    ).toThrowError(DomainValidationError);
  });

  it('rejects duplicate ship identifiers', () => {
    expect(() =>
      createPool([
        { shipId: 'A', complianceBalance: 100 },
        { shipId: 'A', complianceBalance: -50 },
      ]),
    ).toThrowError(DomainValidationError);
  });
});

