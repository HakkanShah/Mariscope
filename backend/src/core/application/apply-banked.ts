import { ComplianceBalance } from '../domain/compliance-balance.js';
import { applyBanked } from '../domain/banking.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface ApplyBankedInput {
  routeId: string;
  amountToApply: number;
}

export interface ApplyBankedOutput {
  routeId: string;
  complianceBalance: number;
  appliedAmount: number;
  remainingBankedAmount: number;
  adjustedComplianceBalance: number;
}

export class ApplyBankedUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  public async execute(input: ApplyBankedInput): Promise<ApplyBankedOutput> {
    const route = await this.routeRepository.getById(input.routeId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.routeId}`);
    }

    const compliance = ComplianceBalance.fromRoute(route);
    const currentBankedAmount = await this.bankRepository.getBankedAmount(route.id);
    const result = applyBanked({
      currentBankedAmount,
      complianceBalance: compliance.complianceBalance,
      amountToApply: input.amountToApply,
    });

    await this.bankRepository.setBankedAmount(route.id, result.remainingBankedAmount);

    return {
      routeId: route.id,
      complianceBalance: compliance.complianceBalance,
      appliedAmount: result.appliedAmount,
      remainingBankedAmount: result.remainingBankedAmount,
      adjustedComplianceBalance: result.adjustedComplianceBalance,
    };
  }
}

