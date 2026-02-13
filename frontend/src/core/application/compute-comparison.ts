import type { ComparisonResult } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class ComputeComparisonUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(year?: number): Promise<ComparisonResult> {
    return this.api.getComparison(year);
  }
}
