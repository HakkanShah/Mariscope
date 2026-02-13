import { applyBanked, ComplianceBalance } from '../domain/index.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface ApplyBankedInput {
  shipId: string;
  amountToApply: number;
}

export interface ApplyBankedOutput {
  shipId: string;
  year: number;
  cbBefore: number;
  applied: number;
  cbAfter: number;
  remainingBankedAmount: number;
}

export class ApplyBankedUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  public async execute(input: ApplyBankedInput): Promise<ApplyBankedOutput> {
    const route = await this.routeRepository.getById(input.shipId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.shipId}`);
    }

    const compliance = ComplianceBalance.fromRoute(route);
    const currentBankedAmount = await this.bankRepository.getBankedAmount(route.id, route.year);
    const result = applyBanked({
      currentBankedAmount,
      complianceBalance: compliance.complianceBalance,
      amountToApply: input.amountToApply,
    });

    await this.bankRepository.saveRecord({
      shipId: route.id,
      year: route.year,
      entryType: 'apply',
      amount: result.appliedAmount,
    });

    return {
      shipId: route.id,
      year: route.year,
      cbBefore: compliance.complianceBalance,
      applied: result.appliedAmount,
      cbAfter: result.adjustedComplianceBalance,
      remainingBankedAmount: result.remainingBankedAmount,
    };
  }
}
