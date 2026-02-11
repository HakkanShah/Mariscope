import type {
  ApplyBankedResponse,
  BankSurplusResponse,
  ComplianceRouteRecord,
  CreatePoolResponse,
  RouteModel,
} from '../../../core/domain';
import type { MariscopeApiPort } from '../../../core/ports';
import type { HttpClient } from './http-client';

interface RoutesResponse {
  routes: RouteModel[];
}

interface ComplianceResponse {
  routes: ComplianceRouteRecord[];
}

interface RouteResponse {
  route: RouteModel;
}

export class MariscopeApiClient implements MariscopeApiPort {
  public constructor(private readonly httpClient: HttpClient) {}

  public async getRoutes(): Promise<RouteModel[]> {
    const response = await this.httpClient.get<RoutesResponse>('/routes');
    return response.routes;
  }

  public async setBaseline(routeId: string, baselineIntensityGco2ePerMj: number): Promise<RouteModel> {
    const response = await this.httpClient.post<RouteResponse, { baselineIntensityGco2ePerMj: number }>(
      `/routes/${routeId}/baseline`,
      { baselineIntensityGco2ePerMj },
    );

    return response.route;
  }

  public async computeCompliance(): Promise<ComplianceRouteRecord[]> {
    const response = await this.httpClient.get<ComplianceResponse>('/compliance/cb');
    return response.routes;
  }

  public bankSurplus(routeId: string, amountToBank?: number): Promise<BankSurplusResponse> {
    const payload = amountToBank === undefined ? { routeId } : { routeId, amountToBank };
    return this.httpClient.post<BankSurplusResponse, typeof payload>('/banking/bank', payload);
  }

  public applyBanked(routeId: string, amountToApply: number): Promise<ApplyBankedResponse> {
    return this.httpClient.post<ApplyBankedResponse, { routeId: string; amountToApply: number }>(
      '/banking/apply',
      { routeId, amountToApply },
    );
  }

  public createPool(routeIds?: string[]): Promise<CreatePoolResponse> {
    const payload = routeIds === undefined ? {} : { routeIds };
    return this.httpClient.post<CreatePoolResponse, typeof payload>('/pools', payload);
  }
}
