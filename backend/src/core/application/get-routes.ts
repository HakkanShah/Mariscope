import type { RouteProps } from '../domain/route.js';
import type { RouteFilters, RouteRepository } from '../ports/route-repository.js';

export class GetRoutesUseCase {
  public constructor(private readonly routeRepository: RouteRepository) {}

  public async execute(filters?: RouteFilters): Promise<RouteProps[]> {
    const routes = await this.routeRepository.getAll(filters);
    return routes.map((route) => route.toPrimitives());
  }
}
