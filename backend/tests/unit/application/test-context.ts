import {
  ApplyBankedUseCase,
  BankSurplusUseCase,
  ComputeCBUseCase,
  ComputeComparisonUseCase,
  CreatePoolUseCase,
  GetAdjustedCBUseCase,
  GetBankingRecordsUseCase,
  GetRoutesUseCase,
  SetBaselineUseCase,
} from '../../../src/core/application/index.js';
import { Route } from '../../../src/core/domain/route.js';
import {
  InMemoryBankRepository,
  InMemoryComplianceRepository,
  InMemoryPoolRepository,
  InMemoryRouteRepository,
} from '../../../src/adapters/outbound/memory/index.js';
import { INITIAL_ROUTES } from '../../../src/infrastructure/seed/initial-routes.js';

export const createApplicationTestContext = () => {
  const routeRepository = new InMemoryRouteRepository(
    INITIAL_ROUTES.map((route) => Route.create(route)),
  );
  const complianceRepository = new InMemoryComplianceRepository();
  const bankRepository = new InMemoryBankRepository();
  const poolRepository = new InMemoryPoolRepository();

  return {
    repositories: {
      routeRepository,
      complianceRepository,
      bankRepository,
      poolRepository,
    },
    useCases: {
      getRoutes: new GetRoutesUseCase(routeRepository),
      setBaseline: new SetBaselineUseCase(routeRepository),
      computeCB: new ComputeCBUseCase(routeRepository, complianceRepository),
      computeComparison: new ComputeComparisonUseCase(routeRepository),
      getAdjustedCB: new GetAdjustedCBUseCase(routeRepository, bankRepository),
      bankSurplus: new BankSurplusUseCase(routeRepository, bankRepository),
      applyBanked: new ApplyBankedUseCase(routeRepository, bankRepository),
      getBankingRecords: new GetBankingRecordsUseCase(bankRepository),
      createPool: new CreatePoolUseCase(routeRepository, bankRepository, poolRepository),
    },
  };
};
