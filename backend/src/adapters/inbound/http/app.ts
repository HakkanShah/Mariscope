import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import type { HttpDependencies } from './http-dependencies.js';
import { mapErrorToHttp } from './response-helpers.js';
import { registerBankingRoutes } from './routes/banking-routes.js';
import { registerComplianceRoutes } from './routes/compliance-routes.js';
import { registerHealthRoutes } from './routes/health-routes.js';
import { registerPoolRoutes } from './routes/pool-routes.js';
import { registerRouteRoutes } from './routes/route-routes.js';

export interface CreateAppOptions {
  dependencies: HttpDependencies;
  corsOrigin: string;
}

export const createApp = (options: CreateAppOptions): Express => {
  const app = express();

  app.use(cors({ origin: options.corsOrigin }));
  app.use(express.json());

  registerHealthRoutes(app);
  registerRouteRoutes(app, options.dependencies);
  registerComplianceRoutes(app, options.dependencies);
  registerBankingRoutes(app, options.dependencies);
  registerPoolRoutes(app, options.dependencies);

  app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    void next;
    const mapped = mapErrorToHttp(error);
    response.status(mapped.statusCode).json({ message: mapped.message });
  });

  return app;
};
