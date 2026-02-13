import type { ComplianceCBRecord } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class ComputeCBUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(filters?: { shipId?: string; year?: number }): Promise<ComplianceCBRecord[]> {
    return this.api.getComplianceCB(filters);
  }
}
