import { ComplianceBalance } from '../domain/compliance-balance.js';
import { bankSurplus } from '../domain/banking.js';
import type { BankRepository } from '../ports/bank-repository.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface BankSurplusInput {
  shipId: string;
  amountToBank?: number;
}

export interface BankSurplusOutput {
  shipId: string;
  year: number;
  cbBefore: number;
  bankedAmount: number;
  newBankedTotal: number;
}

export class BankSurplusUseCase {
  public constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  public async execute(input: BankSurplusInput): Promise<BankSurplusOutput> {
    const route = await this.routeRepository.getById(input.shipId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.shipId}`);
    }

    const compliance = ComplianceBalance.fromRoute(route);
    const currentBankedAmount = await this.bankRepository.getBankedAmount(route.id, route.year);
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

    await this.bankRepository.saveRecord({
      shipId: route.id,
      year: route.year,
      entryType: 'bank',
      amount: result.bankedAmount,
    });

    const newBankedTotal = await this.bankRepository.getBankedAmount(route.id, route.year);

    return {
      shipId: route.id,
      year: route.year,
      cbBefore: compliance.complianceBalance,
      bankedAmount: result.bankedAmount,
      newBankedTotal,
    };
  }
}
