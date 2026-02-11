import type {
  ApplyBankedResponse,
  BankSurplusResponse,
  ComplianceRouteRecord,
  CreatePoolResponse,
  RouteModel,
} from '../domain';

export interface MariscopeApiPort {
  getRoutes(): Promise<RouteModel[]>;
  setBaseline(routeId: string, baselineIntensityGco2ePerMj: number): Promise<RouteModel>;
  computeCompliance(): Promise<ComplianceRouteRecord[]>;
  bankSurplus(routeId: string, amountToBank?: number): Promise<BankSurplusResponse>;
  applyBanked(routeId: string, amountToApply: number): Promise<ApplyBankedResponse>;
  createPool(routeIds?: string[]): Promise<CreatePoolResponse>;
}

