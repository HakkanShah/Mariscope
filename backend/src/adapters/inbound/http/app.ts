import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import type { HttpDependencies } from './http-dependencies.js';
import { mapErrorToHttp, serializeUnknownError } from './response-helpers.js';
import { registerBankingRoutes } from './routes/banking-routes.js';
import { registerComplianceRoutes } from './routes/compliance-routes.js';
import { registerHealthRoutes } from './routes/health-routes.js';
import { registerPoolRoutes } from './routes/pool-routes.js';
import { registerRouteRoutes } from './routes/route-routes.js';
import { logger } from '../../../shared/logger.js';

export interface CreateAppOptions {
  dependencies: HttpDependencies;
  corsOrigin: string;
}

export const createApp = (options: CreateAppOptions): Express => {
  const app = express();

  app.use(cors({ origin: options.corsOrigin }));
  app.use(express.json());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = randomUUID();
    const startedAt = process.hrtime.bigint();
    response.locals['requestId'] = requestId;

    logger.info('http.request.start', {
      requestId,
      method: request.method,
      path: request.originalUrl,
    });

    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info('http.request.end', {
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
    });

    next();
  });

  registerHealthRoutes(app);
  registerRouteRoutes(app, options.dependencies);
  registerComplianceRoutes(app, options.dependencies);
  registerBankingRoutes(app, options.dependencies);
  registerPoolRoutes(app, options.dependencies);
  app.use((request: Request, response: Response) => {
    const requestId = response.locals['requestId'] as string | undefined;
    response.status(404).json({
      message: `Route not found: ${request.method} ${request.originalUrl}`,
      requestId,
    });
  });

  app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    void next;
    const mapped = mapErrorToHttp(error);
    const requestId = response.locals['requestId'] as string | undefined;

    logger.error('http.request.error', {
      requestId,
      statusCode: mapped.statusCode,
      mappedMessage: mapped.message,
      error: serializeUnknownError(error),
    });

    response.status(mapped.statusCode).json({
      message: mapped.message,
      requestId,
      ...(mapped.exposeDetails ? {} : { details: 'Contact support with requestId if this persists.' }),
    });
  });

  return app;
};
