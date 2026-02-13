import type { Express, Request, Response } from 'express';

import type { ComputeComparisonInput } from '../../../../core/application/compute-comparison.js';
import type { RouteFilters } from '../../../../core/ports/route-repository.js';
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

export const registerRouteRoutes = (app: Express, dependencies: HttpDependencies): void => {
  app.get(
    '/routes',
    asyncHandler(async (request: Request, response: Response) => {
      const filters: RouteFilters = {};
      const vesselType = parseSingleQueryValue(request.query['vesselType']);
      const fuelType = parseSingleQueryValue(request.query['fuelType']);
      const year = parseYear(request.query['year']);

      if (vesselType !== undefined) {
        filters.vesselType = vesselType;
      }

      if (fuelType !== undefined) {
        filters.fuelType = fuelType;
      }

      if (year !== undefined) {
        filters.year = year;
      }

      const routes = await dependencies.useCases.getRoutes.execute(
        Object.keys(filters).length === 0 ? undefined : filters,
      );

      response.status(200).json({ routes });
    }),
  );

  app.get(
    '/routes/comparison',
    asyncHandler(async (request: Request, response: Response) => {
      const input: ComputeComparisonInput = {};
      const year = parseYear(request.query['year']);
      if (year !== undefined) {
        input.year = year;
      }

      const result = await dependencies.useCases.computeComparison.execute(
        Object.keys(input).length === 0 ? undefined : input,
      );

      response.status(200).json(result);
    }),
  );

  app.post(
    '/routes/:id/baseline',
    asyncHandler(async (request: Request, response: Response) => {
      const routeIdParam = request.params['id'];
      const routeId =
        typeof routeIdParam === 'string'
          ? routeIdParam
          : Array.isArray(routeIdParam)
            ? (routeIdParam[0] ?? '')
            : '';

      const updated = await dependencies.useCases.setBaseline.execute({
        routeId,
      });

      response.status(200).json({ route: updated });
    }),
  );
};
