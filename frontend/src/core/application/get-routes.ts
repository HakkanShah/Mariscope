import type { RouteFilters, RouteModel } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class GetRoutesUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(filters?: RouteFilters): Promise<RouteModel[]> {
    return this.api.getRoutes(filters);
  }
}
