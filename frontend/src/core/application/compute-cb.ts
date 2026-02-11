import type { ComplianceRouteRecord } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class ComputeCBUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(): Promise<ComplianceRouteRecord[]> {
    return this.api.computeCompliance();
  }
}

