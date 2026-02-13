import { ComplianceBalance } from '../domain/compliance-balance.js';
import type { ComplianceBalanceResult } from '../domain/compliance-balance.js';
import type { Route } from '../domain/route.js';
import type { ComplianceRepository } from '../ports/compliance-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface ComputedRouteCompliance {
  shipId: string;
  year: number;
  result: ComplianceBalanceResult;
}

export interface ComputeCBInput {
  shipId?: string;
  year?: number;
}

export class ComputeCBUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly complianceRepository: ComplianceRepository,
  ) {}

  public async execute(input?: ComputeCBInput): Promise<ComputedRouteCompliance[]> {
    const routes = await this.getRoutesByFilter(input);

    const results: ComputedRouteCompliance[] = [];

    for (const route of routes) {
      const result = ComplianceBalance.fromRoute(route);
      await this.complianceRepository.saveForShipYear(route.id, route.year, result);
      results.push({
        shipId: route.id,
        year: route.year,
        result,
      });
    }

    return results;
  }

  private async getRoutesByFilter(input?: ComputeCBInput): Promise<Route[]> {
    if (input?.shipId) {
      const route = await this.routeRepository.getById(input.shipId);
      if (!route) {
        throw new NotFoundError(`Route not found: ${input.shipId}`);
      }

      if (input.year !== undefined && route.year !== input.year) {
        return [];
      }

      return [route];
    }

    return this.routeRepository.getAll(
      input?.year === undefined
        ? undefined
        : {
            year: input.year,
          },
    );
  }
}
