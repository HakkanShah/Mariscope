import type { ComplianceBalanceResult } from '../domain/compliance-balance.js';

export interface ComplianceRecord {
  routeId: string;
  result: ComplianceBalanceResult;
}

export interface ComplianceRepository {
  saveForRoute(routeId: string, result: ComplianceBalanceResult): Promise<void>;
  getByRouteId(routeId: string): Promise<ComplianceBalanceResult | null>;
  getAll(): Promise<ComplianceRecord[]>;
}

