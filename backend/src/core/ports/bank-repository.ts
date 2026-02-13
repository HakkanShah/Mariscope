export interface BankRecord {
  id: string;
  shipId: string;
  year: number;
  entryType: 'bank' | 'apply';
  amount: number;
  createdAt: string;
}

export interface SaveBankRecordInput {
  shipId: string;
  year: number;
  entryType: 'bank' | 'apply';
  amount: number;
}

export interface BankRepository {
  getBankedAmount(shipId: string, year: number): Promise<number>;
  saveRecord(input: SaveBankRecordInput): Promise<void>;
  getRecords(filters?: { shipId?: string; year?: number }): Promise<BankRecord[]>;
  getAppliedAmount(shipId: string, year: number): Promise<number>;
}
