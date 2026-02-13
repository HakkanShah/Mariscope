import { ComplianceBalance } from '../domain/compliance-balance.js';
import { createPool } from '../domain/pooling.js';
import type { PoolAdjustmentResult } from '../domain/pooling.js';
import type { Route } from '../domain/route.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { PoolRepository } from '../ports/pool-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import type { SavedPoolResult } from '../ports/pool-repository.js';
import { ApplicationError, NotFoundError } from './errors/application-error.js';

export interface CreatePoolInput {
  year: number;
  shipIds?: string[];
}

export interface CreatePoolOutput extends SavedPoolResult {
  entries: PoolAdjustmentResult[];
  poolSumBefore: number;
  poolSumAfter: number;
}

export class CreatePoolUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
    private readonly poolRepository: PoolRepository,
  ) {}

  public async execute(input: CreatePoolInput): Promise<CreatePoolOutput> {
    if (!Number.isInteger(input.year) || input.year <= 0) {
      throw new ApplicationError('Year must be a positive integer');
    }

    const routes = input.shipIds
      ? await this.getRoutesByIds(input.shipIds, input.year)
      : await this.routeRepository.getAll({ year: input.year });

    const poolBalances: Array<{ shipId: string; complianceBalance: number }> = [];
    for (const route of routes) {
      const cbBefore = ComplianceBalance.fromRoute(route).complianceBalance;
      const applied = await this.bankRepository.getAppliedAmount(route.id, route.year);
      poolBalances.push({
        shipId: route.id,
        complianceBalance: cbBefore + applied,
      });
    }

    const entries = createPool(poolBalances);
    const saved = await this.poolRepository.savePoolResult(input.year, entries);
    const poolSumBefore = entries.reduce((sum, entry) => sum + entry.cbBefore, 0);
    const poolSumAfter = entries.reduce((sum, entry) => sum + entry.cbAfter, 0);

    return {
      ...saved,
      entries,
      poolSumBefore,
      poolSumAfter,
    };
  }

  private async getRoutesByIds(routeIds: string[], year: number): Promise<Route[]> {
    const routes: Route[] = [];

    for (const routeId of routeIds) {
      const route = await this.routeRepository.getById(routeId);
      if (!route) {
        throw new NotFoundError(`Route not found: ${routeId}`);
      }

      if (route.year !== year) {
        throw new ApplicationError(`Route ${routeId} does not belong to year ${year}`);
      }

      routes.push(route);
    }

    return routes;
  }
}
