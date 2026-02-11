import type { Pool } from 'pg';

import { Route } from '../../core/domain/route.js';
import { INITIAL_ROUTES } from '../seed/initial-routes.js';

export const initializePostgresSchema = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fuel_consumption_tonnes DOUBLE PRECISION NOT NULL,
      actual_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      baseline_intensity_gco2e_per_mj DOUBLE PRECISION NULL
    );

    CREATE TABLE IF NOT EXISTS route_compliance (
      route_id TEXT PRIMARY KEY REFERENCES routes(id) ON DELETE CASCADE,
      target_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      actual_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      fuel_consumption_tonnes DOUBLE PRECISION NOT NULL,
      energy_in_scope_mj DOUBLE PRECISION NOT NULL,
      compliance_balance DOUBLE PRECISION NOT NULL,
      percent_difference_from_target DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS route_banks (
      route_id TEXT PRIMARY KEY REFERENCES routes(id) ON DELETE CASCADE,
      banked_amount DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pool_runs (
      pool_id TEXT PRIMARY KEY DEFAULT ('pool-' || md5(random()::text || clock_timestamp()::text)),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pool_entries (
      id BIGSERIAL PRIMARY KEY,
      pool_id TEXT NOT NULL REFERENCES pool_runs(pool_id) ON DELETE CASCADE,
      ship_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
      cb_before DOUBLE PRECISION NOT NULL,
      cb_after DOUBLE PRECISION NOT NULL
    );
  `);
};

export const seedInitialRoutesIfEmpty = async (pool: Pool): Promise<void> => {
  const existing = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM routes');
  const row = existing.rows[0];
  const count = Number(row?.count ?? '0');

  if (count > 0) {
    return;
  }

  for (const routeProps of INITIAL_ROUTES) {
    const route = Route.create(routeProps).toPrimitives();
    await pool.query(
      `
      INSERT INTO routes (
        id,
        name,
        fuel_consumption_tonnes,
        actual_intensity_gco2e_per_mj,
        baseline_intensity_gco2e_per_mj
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        route.id,
        route.name,
        route.fuelConsumptionTonnes,
        route.actualIntensityGco2ePerMj,
        route.baselineIntensityGco2ePerMj,
      ],
    );
  }
};
