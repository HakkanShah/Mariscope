import type { Express, Request, Response } from 'express';

import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

interface CreatePoolRequestBody {
  routeIds?: string[];
}

export const registerPoolRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.post(
    '/pools',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as CreatePoolRequestBody;
      const result =
        body.routeIds === undefined
          ? await dependencies.useCases.createPool.execute()
          : await dependencies.useCases.createPool.execute({ routeIds: body.routeIds });
      response.status(200).json(result);
    }),
  );
};
