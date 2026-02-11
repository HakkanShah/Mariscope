import type { Express, Request, Response } from 'express';

import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

interface BankRequestBody {
  routeId?: string;
  amountToBank?: number;
}

interface ApplyBankedRequestBody {
  routeId?: string;
  amountToApply?: number;
}

export const registerBankingRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.post(
    '/banking/bank',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as BankRequestBody;
      const payload =
        body.amountToBank === undefined
          ? { routeId: body.routeId ?? '' }
          : { routeId: body.routeId ?? '', amountToBank: body.amountToBank };
      const result = await dependencies.useCases.bankSurplus.execute(payload);

      response.status(200).json(result);
    }),
  );

  app.post(
    '/banking/apply',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as ApplyBankedRequestBody;
      const result = await dependencies.useCases.applyBanked.execute({
        routeId: body.routeId ?? '',
        amountToApply: body.amountToApply ?? NaN,
      });

      response.status(200).json(result);
    }),
  );
};
