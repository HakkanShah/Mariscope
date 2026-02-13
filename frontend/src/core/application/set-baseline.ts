import type { RouteModel } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class SetBaselineUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(routeId: string): Promise<RouteModel> {
    return this.api.setBaseline(routeId);
  }
}
