import type { BankRepository } from '../../../core/ports/bank-repository.js';

export class InMemoryBankRepository implements BankRepository {
  private readonly balances = new Map<string, number>();

  public getBankedAmount(routeId: string): Promise<number> {
    return Promise.resolve(this.balances.get(routeId) ?? 0);
  }

  public setBankedAmount(routeId: string, amount: number): Promise<void> {
    this.balances.set(routeId, amount);
    return Promise.resolve();
  }
}
