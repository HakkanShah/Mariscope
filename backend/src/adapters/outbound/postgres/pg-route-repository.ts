import type { Pool } from 'pg';

import { Route } from '../../../core/domain/route.js';
import type { RouteRepository } from '../../../core/ports/route-repository.js';

interface RouteRow {
  id: string;
  name: string;
  fuel_consumption_tonnes: number;
  actual_intensity_gco2e_per_mj: number;
  baseline_intensity_gco2e_per_mj: number | null;
}

const mapRouteRow = (row: RouteRow): Route => {
  return Route.create({
    id: row.id,
    name: row.name,
    fuelConsumptionTonnes: row.fuel_consumption_tonnes,
    actualIntensityGco2ePerMj: row.actual_intensity_gco2e_per_mj,
    baselineIntensityGco2ePerMj: row.baseline_intensity_gco2e_per_mj,
  });
};

export class PgRouteRepository implements RouteRepository {
  public constructor(private readonly pool: Pool) {}

  public async getAll(): Promise<Route[]> {
    const result = await this.pool.query<RouteRow>(
      `
      SELECT
        id,
        name,
        fuel_consumption_tonnes,
        actual_intensity_gco2e_per_mj,
        baseline_intensity_gco2e_per_mj
      FROM routes
      ORDER BY id
      `,
    );

    return result.rows.map(mapRouteRow);
  }

  public async getById(routeId: string): Promise<Route | null> {
    const result = await this.pool.query<RouteRow>(
      `
      SELECT
        id,
        name,
        fuel_consumption_tonnes,
        actual_intensity_gco2e_per_mj,
        baseline_intensity_gco2e_per_mj
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
        name,
        fuel_consumption_tonnes,
        actual_intensity_gco2e_per_mj,
        baseline_intensity_gco2e_per_mj
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        fuel_consumption_tonnes = EXCLUDED.fuel_consumption_tonnes,
        actual_intensity_gco2e_per_mj = EXCLUDED.actual_intensity_gco2e_per_mj,
        baseline_intensity_gco2e_per_mj = EXCLUDED.baseline_intensity_gco2e_per_mj
      `,
      [
        model.id,
        model.name,
        model.fuelConsumptionTonnes,
        model.actualIntensityGco2ePerMj,
        model.baselineIntensityGco2ePerMj,
      ],
    );
  }
}
