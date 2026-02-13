import type { BankRecord, BankRepository } from '../ports/bank-repository.js';

export interface GetBankingRecordsInput {
  shipId?: string;
  year?: number;
}

export interface GetBankingRecordsOutput {
  records: BankRecord[];
  currentBankedAmount?: number;
}

export class GetBankingRecordsUseCase {
  public constructor(private readonly bankRepository: BankRepository) {}

  public async execute(input?: GetBankingRecordsInput): Promise<GetBankingRecordsOutput> {
    const records = await this.bankRepository.getRecords(input);

    if (input?.year !== undefined) {
      const ledgerScope = input.shipId ?? 'fleet-ledger';
      const currentBankedAmount = await this.bankRepository.getBankedAmount(ledgerScope, input.year);
      return {
        records,
        currentBankedAmount,
      };
    }

    return {
      records,
    };
  }
}
