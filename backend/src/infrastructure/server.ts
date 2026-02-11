import type { Server } from 'node:http';

import { createApp } from '../adapters/inbound/http/app.js';
import { loadAppConfig } from './config/env.js';

export const startServer = (): Server => {
  const config = loadAppConfig();
  const app = createApp();

  return app.listen(config.port, () => {
    // Log kept intentionally minimal for scaffold visibility.
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${config.port}`);
  });
};

