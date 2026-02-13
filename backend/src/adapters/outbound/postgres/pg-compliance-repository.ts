import type { Pool } from 'pg';

import type { ComplianceBalanceResult } from '../../../core/domain/compliance-balance.js';
import type {
  ComplianceRecord,
  ComplianceRepository,
} from '../../../core/ports/compliance-repository.js';

interface ComplianceRow {
  ship_id: string;
  year: number;
  target_intensity_gco2e_per_mj: number;
  actual_intensity_gco2e_per_mj: number;
  fuel_consumption_tonnes: number;
  energy_in_scope_mj: number;
  cb_gco2eq: number;
}

const mapResult = (row: ComplianceRow): ComplianceBalanceResult => ({
  targetIntensityGco2ePerMj: row.target_intensity_gco2e_per_mj,
  actualIntensityGco2ePerMj: row.actual_intensity_gco2e_per_mj,
  fuelConsumptionTonnes: row.fuel_consumption_tonnes,
  energyInScopeMj: row.energy_in_scope_mj,
  complianceBalance: row.cb_gco2eq,
});

export class PgComplianceRepository implements ComplianceRepository {
  public constructor(private readonly pool: Pool) {}

  public async saveForShipYear(shipId: string, year: number, result: ComplianceBalanceResult): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO ship_compliance (
        ship_id,
        year,
        cb_gco2eq,
        energy_in_scope_mj,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (ship_id, year) DO UPDATE SET
        cb_gco2eq = EXCLUDED.cb_gco2eq,
        energy_in_scope_mj = EXCLUDED.energy_in_scope_mj,
        target_intensity_gco2e_per_mj = EXCLUDED.target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj = EXCLUDED.actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes = EXCLUDED.fuel_consumption_tonnes,
        computed_at = NOW()
      `,
      [
        shipId,
        year,
        result.complianceBalance,
        result.energyInScopeMj,
        result.targetIntensityGco2ePerMj,
        result.actualIntensityGco2ePerMj,
        result.fuelConsumptionTonnes,
      ],
    );
  }

  public async getByShipYear(shipId: string, year: number): Promise<ComplianceBalanceResult | null> {
    const result = await this.pool.query<ComplianceRow>(
      `
      SELECT
        ship_id,
        year,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        energy_in_scope_mj,
        cb_gco2eq
      FROM ship_compliance
      WHERE ship_id = $1 AND year = $2
      `,
      [shipId, year],
    );

    const row = result.rows[0];
    if (result.rowCount === 0 || !row) {
      return null;
    }

    return mapResult(row);
  }

  public async getAll(filters?: { shipId?: string; year?: number }): Promise<ComplianceRecord[]> {
    const where: string[] = [];
    const values: Array<string | number> = [];

    if (filters?.shipId !== undefined) {
      values.push(filters.shipId);
      where.push(`ship_id = $${values.length}`);
    }

    if (filters?.year !== undefined) {
      values.push(filters.year);
      where.push(`year = $${values.length}`);
    }

    const whereClause = where.length === 0 ? '' : `WHERE ${where.join(' AND ')}`;

    const result = await this.pool.query<ComplianceRow>(
      `
      SELECT
        ship_id,
        year,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        energy_in_scope_mj,
        cb_gco2eq
      FROM ship_compliance
      ${whereClause}
      ORDER BY ship_id
      `,
      values,
    );

    return result.rows.map((row) => ({
      shipId: row.ship_id,
      year: row.year,
      result: mapResult(row),
    }));
  }
}
