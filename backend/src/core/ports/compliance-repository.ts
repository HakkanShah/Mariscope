import type { ComplianceBalanceResult } from '../domain/compliance-balance.js';

export interface ComplianceRecord {
  shipId: string;
  year: number;
  result: ComplianceBalanceResult;
}

export interface ComplianceRepository {
  saveForShipYear(shipId: string, year: number, result: ComplianceBalanceResult): Promise<void>;
  getByShipYear(shipId: string, year: number): Promise<ComplianceBalanceResult | null>;
  getAll(filters?: { shipId?: string; year?: number }): Promise<ComplianceRecord[]>;
}
