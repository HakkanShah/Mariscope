import type { Server } from 'node:http';

import { createApp } from '../adapters/inbound/http/app.js';
import { loadAppConfig } from './config/env.js';
import { createAppDependencies } from './wiring/dependencies.js';

export const startServer = async (): Promise<Server> => {
  const config = loadAppConfig();
  const dependencies = await createAppDependencies(config);
  const app = createApp({
    dependencies,
    corsOrigin: config.corsOrigin,
  });

  return app.listen(config.port, () => {
    // Log kept intentionally minimal for scaffold visibility.
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${config.port}`);
  });
};
