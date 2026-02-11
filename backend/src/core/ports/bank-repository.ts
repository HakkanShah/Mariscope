export interface BankRepository {
  getBankedAmount(routeId: string): Promise<number>;
  setBankedAmount(routeId: string, amount: number): Promise<void>;
}

