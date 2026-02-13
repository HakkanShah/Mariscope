export interface BankSurplusResponse {
  shipId: string;
  year: number;
  cbBefore: number;
  bankedAmount: number;
  newBankedTotal: number;
}

export interface ApplyBankedResponse {
  shipId: string;
  year: number;
  cbBefore: number;
  applied: number;
  cbAfter: number;
  remainingBankedAmount: number;
}

export interface BankRecord {
  id: string;
  shipId: string;
  year: number;
  entryType: 'bank' | 'apply';
  amount: number;
  createdAt: string;
}

export interface BankingRecordsResponse {
  records: BankRecord[];
  currentBankedAmount?: number;
}
