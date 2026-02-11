import { Pool } from 'pg';

import type { AppConfig } from '../config/env.js';

export const createPgPool = (config: AppConfig): Pool => {
  return new Pool({
    connectionString: config.databaseUrl,
  });
};

