import type { Pool } from 'pg';

import type { AppConfig } from '../config/env.js';
import { createPgPool } from '../db/postgres.js';

export interface InfrastructureDependencies {
  dbPool: Pool;
}

export const createInfrastructureDependencies = (
  config: AppConfig,
): InfrastructureDependencies => {
  return {
    dbPool: createPgPool(config),
  };
};

