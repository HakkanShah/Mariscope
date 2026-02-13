import type { AdjustedComplianceRecord } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class GetAdjustedCBUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(filters?: { shipId?: string; year?: number }): Promise<AdjustedComplianceRecord[]> {
    return this.api.getAdjustedCB(filters);
  }
}
