export interface BankSurplusResponse {
  routeId: string;
  complianceBalance: number;
  bankedAmount: number;
  newBankedTotal: number;
}

export interface ApplyBankedResponse {
  routeId: string;
  complianceBalance: number;
  appliedAmount: number;
  remainingBankedAmount: number;
  adjustedComplianceBalance: number;
}

