import type { Express, Request, Response } from 'express';

import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

export const registerComplianceRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.get(
    '/compliance/cb',
    asyncHandler(async (_request: Request, response: Response) => {
      const computed = await dependencies.useCases.computeCB.execute();

      response.status(200).json({
        routes: computed.map((item) => ({
          routeId: item.routeId,
          routeName: item.routeName,
          ...item.result,
        })),
      });
    }),
  );
};

