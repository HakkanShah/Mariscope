import type { RouteProps } from '../domain/route.js';
import type { RouteRepository } from '../ports/route-repository.js';

export class GetRoutesUseCase {
  public constructor(private readonly routeRepository: RouteRepository) {}

  public async execute(): Promise<RouteProps[]> {
    const routes = await this.routeRepository.getAll();
    return routes.map((route) => route.toPrimitives());
  }
}

