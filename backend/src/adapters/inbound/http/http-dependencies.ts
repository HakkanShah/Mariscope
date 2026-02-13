import type {
  ApplyBankedUseCase,
  BankSurplusUseCase,
  ComputeCBUseCase,
  ComputeComparisonUseCase,
  CreatePoolUseCase,
  GetAdjustedCBUseCase,
  GetBankingRecordsUseCase,
  GetRoutesUseCase,
  SetBaselineUseCase,
} from '../../../core/application/index.js';

export interface HttpDependencies {
  useCases: {
    getRoutes: GetRoutesUseCase;
    setBaseline: SetBaselineUseCase;
    computeCB: ComputeCBUseCase;
    computeComparison: ComputeComparisonUseCase;
    getAdjustedCB: GetAdjustedCBUseCase;
    bankSurplus: BankSurplusUseCase;
    applyBanked: ApplyBankedUseCase;
    getBankingRecords: GetBankingRecordsUseCase;
    createPool: CreatePoolUseCase;
  };
}
