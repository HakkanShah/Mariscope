import type {
  ComplianceRecord,
  ComplianceRepository,
} from '../../../core/ports/compliance-repository.js';
import type { ComplianceBalanceResult } from '../../../core/domain/compliance-balance.js';

export class InMemoryComplianceRepository implements ComplianceRepository {
  private readonly records = new Map<string, ComplianceBalanceResult>();

  public saveForRoute(routeId: string, result: ComplianceBalanceResult): Promise<void> {
    this.records.set(routeId, result);
    return Promise.resolve();
  }

  public getByRouteId(routeId: string): Promise<ComplianceBalanceResult | null> {
    return Promise.resolve(this.records.get(routeId) ?? null);
  }

  public getAll(): Promise<ComplianceRecord[]> {
    return Promise.resolve([...this.records.entries()].map(([routeId, result]) => ({ routeId, result })));
  }
}
