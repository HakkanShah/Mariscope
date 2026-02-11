import { ComplianceBalance } from '../domain/compliance-balance.js';
import { bankSurplus } from '../domain/banking.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface BankSurplusInput {
  routeId: string;
  amountToBank?: number;
}

export interface BankSurplusOutput {
  routeId: string;
  complianceBalance: number;
  bankedAmount: number;
  newBankedTotal: number;
}

export class BankSurplusUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  public async execute(input: BankSurplusInput): Promise<BankSurplusOutput> {
    const route = await this.routeRepository.getById(input.routeId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.routeId}`);
    }

    const compliance = ComplianceBalance.fromRoute(route);
    const currentBankedAmount = await this.bankRepository.getBankedAmount(route.id);
    const request =
      input.amountToBank === undefined
        ? {
            currentBankedAmount,
            complianceBalance: compliance.complianceBalance,
          }
        : {
            currentBankedAmount,
            complianceBalance: compliance.complianceBalance,
            amountToBank: input.amountToBank,
          };
    const result = bankSurplus(request);

    await this.bankRepository.setBankedAmount(route.id, result.newBankedTotal);

    return {
      routeId: route.id,
      complianceBalance: compliance.complianceBalance,
      bankedAmount: result.bankedAmount,
      newBankedTotal: result.newBankedTotal,
    };
  }
}
