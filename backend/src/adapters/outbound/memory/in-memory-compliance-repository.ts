import type {
  ComplianceRecord,
  ComplianceRepository,
} from '../../../core/ports/compliance-repository.js';
import type { ComplianceBalanceResult } from '../../../core/domain/compliance-balance.js';

const makeKey = (shipId: string, year: number): string => `${shipId}::${year}`;

interface StoredRecord {
  shipId: string;
  year: number;
  result: ComplianceBalanceResult;
}

export class InMemoryComplianceRepository implements ComplianceRepository {
  private readonly records = new Map<string, StoredRecord>();

  public saveForShipYear(shipId: string, year: number, result: ComplianceBalanceResult): Promise<void> {
    this.records.set(makeKey(shipId, year), { shipId, year, result });
    return Promise.resolve();
  }

  public getByShipYear(shipId: string, year: number): Promise<ComplianceBalanceResult | null> {
    return Promise.resolve(this.records.get(makeKey(shipId, year))?.result ?? null);
  }

  public getAll(filters?: { shipId?: string; year?: number }): Promise<ComplianceRecord[]> {
    const values = [...this.records.values()]
      .filter((record) => {
        if (filters?.shipId !== undefined && filters.shipId !== record.shipId) {
          return false;
        }

        if (filters?.year !== undefined && filters.year !== record.year) {
          return false;
        }

        return true;
      })
      .map((record) => ({
        shipId: record.shipId,
        year: record.year,
        result: record.result,
      }));

    return Promise.resolve(values);
  }
}
