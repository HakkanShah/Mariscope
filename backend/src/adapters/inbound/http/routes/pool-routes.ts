import type { Express, Request, Response } from 'express';

import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

interface CreatePoolRequestBody {
  year?: number;
  shipIds?: string[];
}

export const registerPoolRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.post(
    '/pools',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as CreatePoolRequestBody;
      const result =
        body.shipIds === undefined
          ? await dependencies.useCases.createPool.execute({
              year: body.year ?? NaN,
            })
          : await dependencies.useCases.createPool.execute({
              year: body.year ?? NaN,
              shipIds: body.shipIds,
            });

      response.status(200).json(result);
    }),
  );
};
