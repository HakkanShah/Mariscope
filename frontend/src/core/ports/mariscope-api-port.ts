import type {
  AdjustedComplianceRecord,
  ApplyBankedResponse,
  BankSurplusResponse,
  BankingRecordsResponse,
  ComparisonResult,
  ComplianceCBRecord,
  CreatePoolResponse,
  RouteFilters,
  RouteModel,
} from '../domain';

export interface MariscopeApiPort {
  getRoutes(filters?: RouteFilters): Promise<RouteModel[]>;
  setBaseline(routeId: string): Promise<RouteModel>;
  getComparison(year?: number): Promise<ComparisonResult>;
  getComplianceCB(filters?: { shipId?: string; year?: number }): Promise<ComplianceCBRecord[]>;
  getAdjustedCB(filters?: { shipId?: string; year?: number }): Promise<AdjustedComplianceRecord[]>;
  bankSurplus(shipId: string, amountToBank?: number): Promise<BankSurplusResponse>;
  applyBanked(shipId: string, amountToApply: number): Promise<ApplyBankedResponse>;
  getBankingRecords(filters?: { shipId?: string; year?: number }): Promise<BankingRecordsResponse>;
  createPool(year: number, shipIds?: string[]): Promise<CreatePoolResponse>;
}
