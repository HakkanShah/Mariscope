import type { Express, Request, Response } from 'express';

import type { ComputeCBInput } from '../../../../core/application/compute-cb.js';
import type { GetAdjustedCBInput } from '../../../../core/application/get-adjusted-cb.js';
import type { HttpDependencies } from '../http-dependencies.js';
import { asyncHandler } from '../response-helpers.js';

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

export const registerComplianceRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.get(
    '/compliance/cb',
    asyncHandler(async (request: Request, response: Response) => {
      const input: ComputeCBInput = {};
      const shipId = parseSingleQueryValue(request.query['shipId']);
      const year = parseYear(request.query['year']);

      if (shipId !== undefined) {
        input.shipId = shipId;
      }

      if (year !== undefined) {
        input.year = year;
      }

      const computed = await dependencies.useCases.computeCB.execute(
        Object.keys(input).length === 0 ? undefined : input,
      );

      response.status(200).json({
        records: computed.map((item) => ({
          shipId: item.shipId,
          year: item.year,
          cb: item.result.complianceBalance,
          energyInScopeMj: item.result.energyInScopeMj,
          targetIntensityGco2ePerMj: item.result.targetIntensityGco2ePerMj,
          actualIntensityGco2ePerMj: item.result.actualIntensityGco2ePerMj,
        })),
      });
    }),
  );

  app.get(
    '/compliance/adjusted-cb',
    asyncHandler(async (request: Request, response: Response) => {
      const input: GetAdjustedCBInput = {};
      const shipId = parseSingleQueryValue(request.query['shipId']);
      const year = parseYear(request.query['year']);

      if (shipId !== undefined) {
        input.shipId = shipId;
      }

      if (year !== undefined) {
        input.year = year;
      }

      const adjusted = await dependencies.useCases.getAdjustedCB.execute(
        Object.keys(input).length === 0 ? undefined : input,
      );

      response.status(200).json({
        records: adjusted,
      });
    }),
  );
};
