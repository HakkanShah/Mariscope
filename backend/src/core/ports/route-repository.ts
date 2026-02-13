import type { Route } from '../domain/route.js';

export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

export interface RouteRepository {
  getAll(filters?: RouteFilters): Promise<Route[]>;
  getById(routeId: string): Promise<Route | null>;
  save(route: Route): Promise<void>;
}
