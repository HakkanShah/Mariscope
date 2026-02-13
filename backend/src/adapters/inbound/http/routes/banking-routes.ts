import type { Express, Request, Response } from 'express';

import type { GetBankingRecordsInput } from '../../../../core/application/get-banking-records.js';
import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

interface BankRequestBody {
  shipId?: string;
  amountToBank?: number;
}

interface ApplyBankedRequestBody {
  shipId?: string;
  amountToApply?: number;
}

const parseSingleQueryValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim().length > 0) {
    return value[0];
  }

  return undefined;
};

const parseYear = (value: unknown): number | undefined => {
  const raw = parseSingleQueryValue(value);
  if (raw === undefined) {
    return undefined;
  }

  const year = Number(raw);
  return Number.isInteger(year) ? year : undefined;
};

export const registerBankingRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.get(
    '/banking/records',
    asyncHandler(async (request: Request, response: Response) => {
      const input: GetBankingRecordsInput = {};
      const shipId = parseSingleQueryValue(request.query['shipId']);
      const year = parseYear(request.query['year']);

      if (shipId !== undefined) {
        input.shipId = shipId;
      }

      if (year !== undefined) {
        input.year = year;
      }

      const records = await dependencies.useCases.getBankingRecords.execute(
        Object.keys(input).length === 0 ? undefined : input,
      );

      response.status(200).json(records);
    }),
  );

  app.post(
    '/banking/bank',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as BankRequestBody;
      const payload =
        body.amountToBank === undefined
          ? { shipId: body.shipId ?? '' }
          : { shipId: body.shipId ?? '', amountToBank: body.amountToBank };
      const result = await dependencies.useCases.bankSurplus.execute(payload);

      response.status(200).json(result);
    }),
  );

  app.post(
    '/banking/apply',
    asyncHandler(async (request: Request, response: Response) => {
      const body = request.body as ApplyBankedRequestBody;
      const result = await dependencies.useCases.applyBanked.execute({
        shipId: body.shipId ?? '',
        amountToApply: body.amountToApply ?? NaN,
      });

      response.status(200).json(result);
    }),
  );
};
