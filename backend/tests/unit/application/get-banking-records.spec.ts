import { describe, expect, it } from 'vitest';

import { createApplicationTestContext } from './test-context.js';

describe('GetBankingRecordsUseCase', () => {
  it('returns records and current banked amount for ship-year filters', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R002',
      year: 2024,
      entryType: 'bank',
      amount: 300,
    });

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R002',
      year: 2024,
      entryType: 'apply',
      amount: 100,
    });

    const result = await context.useCases.getBankingRecords.execute({ shipId: 'R002', year: 2024 });

    expect(result.records).toHaveLength(2);
    expect(result.currentBankedAmount).toBe(200);
  });

  it('returns filtered records without current amount when year is omitted', async () => {
    const context = createApplicationTestContext();

    await context.repositories.bankRepository.saveRecord({
      shipId: 'R002',
      year: 2024,
      entryType: 'bank',
      amount: 100,
    });

    const result = await context.useCases.getBankingRecords.execute({ shipId: 'R002' });

    expect(result.records).toHaveLength(1);
    expect(result.currentBankedAmount).toBeUndefined();
  });
});
