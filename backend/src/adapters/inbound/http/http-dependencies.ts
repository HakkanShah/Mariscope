import type {
  ApplyBankedUseCase,
  BankSurplusUseCase,
  ComputeCBUseCase,
  CreatePoolUseCase,
  GetRoutesUseCase,
  SetBaselineUseCase,
} from '../../../core/application/index.js';

export interface HttpDependencies {
  useCases: {
    getRoutes: GetRoutesUseCase;
    setBaseline: SetBaselineUseCase;
    computeCB: ComputeCBUseCase;
    bankSurplus: BankSurplusUseCase;
    applyBanked: ApplyBankedUseCase;
    createPool: CreatePoolUseCase;
  };
}

