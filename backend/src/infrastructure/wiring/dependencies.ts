import type { Pool } from 'pg';

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
} from '../../core/application/index.js';
import { Route } from '../../core/domain/route.js';
import type {
  BankRepository,
  ComplianceRepository,
  PoolRepository,
  RouteRepository,
} from '../../core/ports/index.js';
import {
  InMemoryBankRepository,
  InMemoryComplianceRepository,
  InMemoryPoolRepository,
  InMemoryRouteRepository,
} from '../../adapters/outbound/memory/index.js';
import {
  PgBankRepository,
  PgComplianceRepository,
  PgPoolRepository,
  PgRouteRepository,
} from '../../adapters/outbound/postgres/index.js';
import type { AppConfig } from '../config/env.js';
import { createPgPool } from '../db/postgres.js';
import { initializePostgresSchema, seedInitialRoutesIfEmpty } from '../db/init-schema.js';
import { INITIAL_ROUTES } from '../seed/initial-routes.js';

export interface AppDependencies {
  routeRepository: RouteRepository;
  complianceRepository: ComplianceRepository;
  bankRepository: BankRepository;
  poolRepository: PoolRepository;
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

const createUseCases = (repositories: {
  routeRepository: RouteRepository;
  complianceRepository: ComplianceRepository;
  bankRepository: BankRepository;
  poolRepository: PoolRepository;
}): AppDependencies['useCases'] => {
  return {
    getRoutes: new GetRoutesUseCase(repositories.routeRepository),
    setBaseline: new SetBaselineUseCase(repositories.routeRepository),
    computeCB: new ComputeCBUseCase(repositories.routeRepository, repositories.complianceRepository),
    computeComparison: new ComputeComparisonUseCase(repositories.routeRepository),
    getAdjustedCB: new GetAdjustedCBUseCase(repositories.routeRepository, repositories.bankRepository),
    bankSurplus: new BankSurplusUseCase(repositories.routeRepository, repositories.bankRepository),
    applyBanked: new ApplyBankedUseCase(repositories.routeRepository, repositories.bankRepository),
    getBankingRecords: new GetBankingRecordsUseCase(repositories.bankRepository),
    createPool: new CreatePoolUseCase(
      repositories.routeRepository,
      repositories.bankRepository,
      repositories.poolRepository,
    ),
  };
};

const createMemoryDependencies = (): AppDependencies => {
  const routeRepository = new InMemoryRouteRepository(INITIAL_ROUTES.map((route) => Route.create(route)));
  const complianceRepository = new InMemoryComplianceRepository();
  const bankRepository = new InMemoryBankRepository();
  const poolRepository = new InMemoryPoolRepository();

  return {
    routeRepository,
    complianceRepository,
    bankRepository,
    poolRepository,
    useCases: createUseCases({
      routeRepository,
      complianceRepository,
      bankRepository,
      poolRepository,
    }),
  };
};

const createPostgresRepositories = (pool: Pool) => {
  const routeRepository = new PgRouteRepository(pool);
  const complianceRepository = new PgComplianceRepository(pool);
  const bankRepository = new PgBankRepository(pool);
  const poolRepository = new PgPoolRepository(pool);

  return {
    routeRepository,
    complianceRepository,
    bankRepository,
    poolRepository,
  };
};

export const createAppDependencies = async (config: AppConfig): Promise<AppDependencies> => {
  if (config.persistenceDriver === 'memory') {
    return createMemoryDependencies();
  }

  const dbPool = createPgPool(config);
  await initializePostgresSchema(dbPool);
  await seedInitialRoutesIfEmpty(dbPool);

  const repositories = createPostgresRepositories(dbPool);

  return {
    ...repositories,
    useCases: createUseCases(repositories),
  };
};
