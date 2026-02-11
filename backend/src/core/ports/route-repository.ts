import type { Route } from '../domain/route.js';

export interface RouteRepository {
  getAll(): Promise<Route[]>;
  getById(routeId: string): Promise<Route | null>;
  save(route: Route): Promise<void>;
}

