import { ComplianceBalance } from '../domain/compliance-balance.js';
import type { ComplianceBalanceResult } from '../domain/compliance-balance.js';
import type { Route } from '../domain/route.js';
import type { ComplianceRepository } from '../ports/compliance-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface ComputedRouteCompliance {
  routeId: string;
  routeName: string;
  result: ComplianceBalanceResult;
}

export interface ComputeCBInput {
  routeIds?: string[];
}

export class ComputeCBUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly complianceRepository: ComplianceRepository,
  ) {}

  public async execute(input?: ComputeCBInput): Promise<ComputedRouteCompliance[]> {
    const routes = input?.routeIds
      ? await this.getRoutesByIds(input.routeIds)
      : await this.routeRepository.getAll();

    const results: ComputedRouteCompliance[] = [];

    for (const route of routes) {
      const result = ComplianceBalance.fromRoute(route);
      await this.complianceRepository.saveForRoute(route.id, result);
      results.push({
        routeId: route.id,
        routeName: route.name,
        result,
      });
    }

    return results;
  }

  private async getRoutesByIds(routeIds: string[]) {
    const routes: Route[] = [];

    for (const routeId of routeIds) {
      const route = await this.routeRepository.getById(routeId);
      if (!route) {
        throw new NotFoundError(`Route not found: ${routeId}`);
      }
      routes.push(route);
    }

    return routes;
  }
}
