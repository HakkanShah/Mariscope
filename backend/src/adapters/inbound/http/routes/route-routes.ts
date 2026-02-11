import type { Express, Request, Response } from 'express';

import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

interface SetBaselineBody {
  baselineIntensityGco2ePerMj?: number;
}

export const registerRouteRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.get(
    '/routes',
    asyncHandler(async (_request: Request, response: Response) => {
      const routes = await dependencies.useCases.getRoutes.execute();
      response.status(200).json({ routes });
    }),
  );

  app.post(
    '/routes/:id/baseline',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as SetBaselineBody;
      const routeIdParam = request.params['id'];
      const routeId =
        typeof routeIdParam === 'string'
          ? routeIdParam
          : Array.isArray(routeIdParam)
            ? (routeIdParam[0] ?? '')
            : '';
      const updated = await dependencies.useCases.setBaseline.execute({
        routeId,
        baselineIntensityGco2ePerMj: body.baselineIntensityGco2ePerMj ?? NaN,
      });

      response.status(200).json({ route: updated });
    }),
  );
};
