import type { Route } from '../../../core/domain/route.js';
import type { RouteRepository } from '../../../core/ports/route-repository.js';

export class InMemoryRouteRepository implements RouteRepository {
  private readonly routes = new Map<string, Route>();

  public constructor(seedRoutes: Route[] = []) {
    for (const route of seedRoutes) {
      this.routes.set(route.id, route);
    }
  }

  public getAll(): Promise<Route[]> {
    return Promise.resolve([...this.routes.values()]);
  }

  public getById(routeId: string): Promise<Route | null> {
    return Promise.resolve(this.routes.get(routeId) ?? null);
  }

  public save(route: Route): Promise<void> {
    this.routes.set(route.id, route);
    return Promise.resolve();
  }
}
