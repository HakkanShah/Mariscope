import type { ApplyBankedResponse } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class ApplyBankedUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(routeId: string, amountToApply: number): Promise<ApplyBankedResponse> {
    return this.api.applyBanked(routeId, amountToApply);
  }
}

