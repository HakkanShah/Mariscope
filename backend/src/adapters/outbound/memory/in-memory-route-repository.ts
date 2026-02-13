import type { Route } from '../../../core/domain/route.js';
import type { RouteFilters, RouteRepository } from '../../../core/ports/route-repository.js';

export class InMemoryRouteRepository implements RouteRepository {
  private readonly routes = new Map<string, Route>();

  public constructor(seedRoutes: Route[] = []) {
    for (const route of seedRoutes) {
      this.routes.set(route.id, route);
    }
  }

  public getAll(filters?: RouteFilters): Promise<Route[]> {
    const routes = [...this.routes.values()].filter((route) => {
      if (filters?.year !== undefined && route.year !== filters.year) {
        return false;
      }

      if (filters?.vesselType !== undefined && route.vesselType !== filters.vesselType) {
        return false;
      }

      if (filters?.fuelType !== undefined && route.fuelType !== filters.fuelType) {
        return false;
      }

      return true;
    });

    return Promise.resolve(routes);
  }

  public getById(routeId: string): Promise<Route | null> {
    return Promise.resolve(this.routes.get(routeId) ?? null);
  }

  public save(route: Route): Promise<void> {
    this.routes.set(route.id, route);
    return Promise.resolve();
  }
}
