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
} from '../../../core/domain';
import type { MariscopeApiPort } from '../../../core/ports';
import type { HttpClient } from './http-client';

interface RoutesResponse {
  routes: RouteModel[];
}

interface RouteResponse {
  route: RouteModel;
}

interface ComplianceResponse {
  records: ComplianceCBRecord[];
}

interface AdjustedComplianceResponse {
  records: AdjustedComplianceRecord[];
}

const buildQuery = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query.length === 0 ? '' : `?${query}`;
};

export class MariscopeApiClient implements MariscopeApiPort {
  public constructor(private readonly httpClient: HttpClient) {}

  public async getRoutes(filters?: RouteFilters): Promise<RouteModel[]> {
    const query = buildQuery({
      vesselType: filters?.vesselType,
      fuelType: filters?.fuelType,
      year: filters?.year,
    });

    const response = await this.httpClient.get<RoutesResponse>(`/routes${query}`);
    return response.routes;
  }

  public async setBaseline(routeId: string): Promise<RouteModel> {
    const response = await this.httpClient.post<RouteResponse, Record<string, never>>(
      `/routes/${routeId}/baseline`,
      {},
    );

    return response.route;
  }

  public getComparison(year?: number): Promise<ComparisonResult> {
    const query = buildQuery({ year });
    return this.httpClient.get<ComparisonResult>(`/routes/comparison${query}`);
  }

  public async getComplianceCB(filters?: { shipId?: string; year?: number }): Promise<ComplianceCBRecord[]> {
    const query = buildQuery({
      shipId: filters?.shipId,
      year: filters?.year,
    });

    const response = await this.httpClient.get<ComplianceResponse>(`/compliance/cb${query}`);
    return response.records;
  }

  public async getAdjustedCB(filters?: { shipId?: string; year?: number }): Promise<AdjustedComplianceRecord[]> {
    const query = buildQuery({
      shipId: filters?.shipId,
      year: filters?.year,
    });

    const response = await this.httpClient.get<AdjustedComplianceResponse>(
      `/compliance/adjusted-cb${query}`,
    );
    return response.records;
  }

  public bankSurplus(shipId: string, amountToBank?: number): Promise<BankSurplusResponse> {
    const payload = amountToBank === undefined ? { shipId } : { shipId, amountToBank };
    return this.httpClient.post<BankSurplusResponse, typeof payload>('/banking/bank', payload);
  }

  public applyBanked(shipId: string, amountToApply: number): Promise<ApplyBankedResponse> {
    return this.httpClient.post<ApplyBankedResponse, { shipId: string; amountToApply: number }>(
      '/banking/apply',
      { shipId, amountToApply },
    );
  }

  public getBankingRecords(filters?: { shipId?: string; year?: number }): Promise<BankingRecordsResponse> {
    const query = buildQuery({
      shipId: filters?.shipId,
      year: filters?.year,
    });

    return this.httpClient.get<BankingRecordsResponse>(`/banking/records${query}`);
  }

  public createPool(year: number, shipIds?: string[]): Promise<CreatePoolResponse> {
    const payload = shipIds === undefined ? { year } : { year, shipIds };
    return this.httpClient.post<CreatePoolResponse, typeof payload>('/pools', payload);
  }
}
