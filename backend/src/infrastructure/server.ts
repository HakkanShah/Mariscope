import type { Server } from 'node:http';

import { createApp } from '../adapters/inbound/http/app.js';
import { loadAppConfig } from './config/env.js';
import { createAppDependencies } from './wiring/dependencies.js';
import { logger } from '../shared/logger.js';

export const startServer = async (): Promise<Server> => {
  const config = loadAppConfig();
  logger.info('server.bootstrap.start', {
    port: config.port,
    persistenceDriver: config.persistenceDriver,
    nodeEnv: config.nodeEnv,
    logLevel: config.logLevel,
  });

  const dependencies = await createAppDependencies(config);
  const app = createApp({
    dependencies,
    corsOrigin: config.corsOrigin,
  });

  return app.listen(config.port, () => {
    logger.info('server.bootstrap.ready', {
      port: config.port,
    });
  });
};
