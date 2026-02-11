import type { RouteModel } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class GetRoutesUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(): Promise<RouteModel[]> {
    return this.api.getRoutes();
  }
}

