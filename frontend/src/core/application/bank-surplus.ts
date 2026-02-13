import type { BankSurplusResponse } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class BankSurplusUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(shipId: string, amountToBank?: number): Promise<BankSurplusResponse> {
    return this.api.bankSurplus(shipId, amountToBank);
  }
}
