import type { BankingRecordsResponse } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class GetBankingRecordsUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(filters?: { shipId?: string; year?: number }): Promise<BankingRecordsResponse> {
    return this.api.getBankingRecords(filters);
  }
}
