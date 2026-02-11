import { ComplianceBalance } from '../domain/compliance-balance.js';
import { createPool } from '../domain/pooling.js';
import type { PoolAdjustmentResult } from '../domain/pooling.js';
import type { Route } from '../domain/route.js';
import type { PoolRepository } from '../ports/pool-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import type { SavedPoolResult } from '../ports/pool-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface CreatePoolInput {
  routeIds?: string[];
}

export interface CreatePoolOutput extends SavedPoolResult {
  entries: PoolAdjustmentResult[];
}

export class CreatePoolUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly poolRepository: PoolRepository,
  ) {}

  public async execute(input?: CreatePoolInput): Promise<CreatePoolOutput> {
    const routes = input?.routeIds
      ? await this.getRoutesByIds(input.routeIds)
      : await this.routeRepository.getAll();

    const entries = createPool(
      routes.map((route) => ({
        shipId: route.id,
        complianceBalance: ComplianceBalance.fromRoute(route).complianceBalance,
      })),
    );

    const saved = await this.poolRepository.savePoolResult(entries);

    return {
      ...saved,
      entries,
    };
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
