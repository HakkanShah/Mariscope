import type { BankRecord, BankRepository, SaveBankRecordInput } from '../../../core/ports/bank-repository.js';

export class InMemoryBankRepository implements BankRepository {
  private records: BankRecord[] = [];

  public getBankedAmount(shipId: string, year: number): Promise<number> {
    const totals = this.records
      .filter((record) => record.shipId === shipId && record.year === year)
      .reduce(
        (accumulator, record) => {
          if (record.entryType === 'bank') {
            return {
              banked: accumulator.banked + record.amount,
              applied: accumulator.applied,
            };
          }

          return {
            banked: accumulator.banked,
            applied: accumulator.applied + record.amount,
          };
        },
        { banked: 0, applied: 0 },
      );

    return Promise.resolve(Math.max(0, totals.banked - totals.applied));
  }

  public saveRecord(input: SaveBankRecordInput): Promise<void> {
    const record: BankRecord = {
      id: `record-${this.records.length + 1}`,
      shipId: input.shipId,
      year: input.year,
      entryType: input.entryType,
      amount: input.amount,
      createdAt: new Date().toISOString(),
    };

    this.records = [...this.records, record];
    return Promise.resolve();
  }

  public getRecords(filters?: { shipId?: string; year?: number }): Promise<BankRecord[]> {
    const rows = this.records.filter((record) => {
      if (filters?.shipId !== undefined && filters.shipId !== record.shipId) {
        return false;
      }

      if (filters?.year !== undefined && filters.year !== record.year) {
        return false;
      }

      return true;
    });

    return Promise.resolve(rows);
  }

  public async getAppliedAmount(shipId: string, year: number): Promise<number> {
    const records = await this.getRecords({ shipId, year });
    return records
      .filter((record) => record.entryType === 'apply')
      .reduce((sum, record) => sum + record.amount, 0);
  }
}
