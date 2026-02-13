import { ComplianceBalance } from '../domain/compliance-balance.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface GetAdjustedCBInput {
  shipId?: string;
  year?: number;
}

export interface AdjustedCBRecord {
  shipId: string;
  year: number;
  cbBefore: number;
  applied: number;
  adjustedCb: number;
}

export class GetAdjustedCBUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  public async execute(input?: GetAdjustedCBInput): Promise<AdjustedCBRecord[]> {
    const routes = await this.getRoutesByFilter(input);

    const output: AdjustedCBRecord[] = [];
    for (const route of routes) {
      const compliance = ComplianceBalance.fromRoute(route);
      const applied = await this.bankRepository.getAppliedAmount(route.id, route.year);
      output.push({
        shipId: route.id,
        year: route.year,
        cbBefore: compliance.complianceBalance,
        applied,
        adjustedCb: compliance.complianceBalance + applied,
      });
    }

    return output;
  }

  private async getRoutesByFilter(input?: GetAdjustedCBInput) {
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
      input?.year === undefined ? undefined : { year: input.year },
    );
  }
}
