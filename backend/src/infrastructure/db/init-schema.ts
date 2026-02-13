import type { Pool } from 'pg';

import { Route } from '../../core/domain/route.js';
import { INITIAL_BANK_ENTRIES } from '../seed/initial-bank-entries.js';
import { INITIAL_ROUTES } from '../seed/initial-routes.js';

export const initializePostgresSchema = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      vessel_type TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      year INTEGER NOT NULL,
      ghg_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      fuel_consumption_tonnes DOUBLE PRECISION NOT NULL,
      distance_km DOUBLE PRECISION NOT NULL,
      total_emissions_tonnes DOUBLE PRECISION NOT NULL,
      is_baseline BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS ship_compliance (
      id BIGSERIAL PRIMARY KEY,
      ship_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      cb_gco2eq DOUBLE PRECISION NOT NULL,
      energy_in_scope_mj DOUBLE PRECISION NOT NULL,
      target_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      actual_intensity_gco2e_per_mj DOUBLE PRECISION NOT NULL,
      fuel_consumption_tonnes DOUBLE PRECISION NOT NULL,
      computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (ship_id, year)
    );

    CREATE TABLE IF NOT EXISTS bank_entries (
      id BIGSERIAL PRIMARY KEY,
      ship_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      entry_type TEXT NOT NULL CHECK (entry_type IN ('bank', 'apply')),
      amount_gco2eq DOUBLE PRECISION NOT NULL CHECK (amount_gco2eq > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pools (
      id TEXT PRIMARY KEY DEFAULT ('pool-' || md5(random()::text || clock_timestamp()::text)),
      year INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pool_members (
      id BIGSERIAL PRIMARY KEY,
      pool_id TEXT NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
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
      `,
      [
        route.id,
        route.vesselType,
        route.fuelType,
        route.year,
        route.ghgIntensityGco2ePerMj,
        route.fuelConsumptionTonnes,
        route.distanceKm,
        route.totalEmissionsTonnes,
        route.isBaseline,
      ],
    );
  }
};

export const seedInitialBankEntriesIfEmpty = async (pool: Pool): Promise<void> => {
  const existing = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM bank_entries');
  const row = existing.rows[0];
  const count = Number(row?.count ?? '0');

  if (count > 0) {
    return;
  }

  for (const entry of INITIAL_BANK_ENTRIES) {
    await pool.query(
      `
      INSERT INTO bank_entries (ship_id, year, entry_type, amount_gco2eq)
      VALUES ($1, $2, $3, $4)
      `,
      [entry.shipId, entry.year, entry.entryType, entry.amount],
    );
  }
};
