import {
  ApplyBankedUseCase,
  BankSurplusUseCase,
  ComputeCBUseCase,
  CreatePoolUseCase,
  GetRoutesUseCase,
  SetBaselineUseCase,
} from '../../../core/application';
import { HttpClient } from './http-client';
import { MariscopeApiClient } from './mariscope-api-client';

const env = import.meta.env as Record<string, unknown>;
const configuredBaseUrl = env['VITE_API_BASE_URL'];
const apiBaseUrl =
  typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : 'http://localhost:3001';
const api = new MariscopeApiClient(new HttpClient(apiBaseUrl));

export const frontendUseCases = {
  getRoutes: new GetRoutesUseCase(api),
  setBaseline: new SetBaselineUseCase(api),
  computeCB: new ComputeCBUseCase(api),
  bankSurplus: new BankSurplusUseCase(api),
  applyBanked: new ApplyBankedUseCase(api),
  createPool: new CreatePoolUseCase(api),
};
