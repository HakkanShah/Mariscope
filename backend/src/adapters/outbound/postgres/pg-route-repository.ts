import type { Pool } from 'pg';

import { Route } from '../../../core/domain/route.js';
import type { RouteRepository } from '../../../core/ports/route-repository.js';
import type { RouteFilters } from '../../../core/ports/route-repository.js';

interface RouteRow {
  id: string;
  vessel_type: 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
  fuel_type: 'HFO' | 'LNG' | 'MGO';
  year: number;
  ghg_intensity_gco2e_per_mj: number;
  fuel_consumption_tonnes: number;
  distance_km: number;
  total_emissions_tonnes: number;
  is_baseline: boolean;
}

const mapRouteRow = (row: RouteRow): Route => {
  return Route.create({
    id: row.id,
    vesselType: row.vessel_type,
    fuelType: row.fuel_type,
    year: row.year,
    ghgIntensityGco2ePerMj: row.ghg_intensity_gco2e_per_mj,
    fuelConsumptionTonnes: row.fuel_consumption_tonnes,
    distanceKm: row.distance_km,
    totalEmissionsTonnes: row.total_emissions_tonnes,
    isBaseline: row.is_baseline,
  });
};

export class PgRouteRepository implements RouteRepository {
  public constructor(private readonly pool: Pool) {}

  public async getAll(filters?: RouteFilters): Promise<Route[]> {
    const where: string[] = [];
    const values: Array<string | number> = [];

    if (filters?.year !== undefined) {
      values.push(filters.year);
      where.push(`year = $${values.length}`);
    }

    if (filters?.vesselType !== undefined) {
      values.push(filters.vesselType);
      where.push(`vessel_type = $${values.length}`);
    }

    if (filters?.fuelType !== undefined) {
      values.push(filters.fuelType);
      where.push(`fuel_type = $${values.length}`);
    }

    const whereClause = where.length === 0 ? '' : `WHERE ${where.join(' AND ')}`;

    const result = await this.pool.query<RouteRow>(
      `
      SELECT
        id,
        vessel_type,
        fuel_type,
        year,
        ghg_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        distance_km,
        total_emissions_tonnes,
        is_baseline
      FROM routes
      ${whereClause}
      ORDER BY id
      `,
      values,
    );

    return result.rows.map(mapRouteRow);
  }

  public async getById(routeId: string): Promise<Route | null> {
    const result = await this.pool.query<RouteRow>(
      `
      SELECT
        id,
        vessel_type,
        fuel_type,
        year,
        ghg_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        distance_km,
        total_emissions_tonnes,
        is_baseline
      FROM routes
      WHERE id = $1
      `,
      [routeId],
    );

    const row = result.rows[0];
    if (result.rowCount === 0 || !row) {
      return null;
    }

    return mapRouteRow(row);
  }

  public async save(route: Route): Promise<void> {
    const model = route.toPrimitives();

    await this.pool.query(
      `
      INSERT INTO routes (
        id,
        vessel_type,
        fuel_type,
        year,
        ghg_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        distance_km,
        total_emissions_tonnes,
        is_baseline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        vessel_type = EXCLUDED.vessel_type,
        fuel_type = EXCLUDED.fuel_type,
        year = EXCLUDED.year,
        ghg_intensity_gco2e_per_mj = EXCLUDED.ghg_intensity_gco2e_per_mj,
        fuel_consumption_tonnes = EXCLUDED.fuel_consumption_tonnes,
        distance_km = EXCLUDED.distance_km,
        total_emissions_tonnes = EXCLUDED.total_emissions_tonnes,
        is_baseline = EXCLUDED.is_baseline
      `,
      [
        model.id,
        model.vesselType,
        model.fuelType,
        model.year,
        model.ghgIntensityGco2ePerMj,
        model.fuelConsumptionTonnes,
        model.distanceKm,
        model.totalEmissionsTonnes,
        model.isBaseline,
      ],
    );
  }
}
