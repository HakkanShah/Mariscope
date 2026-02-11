import type { Pool } from 'pg';

import type { ComplianceBalanceResult } from '../../../core/domain/compliance-balance.js';
import type {
  ComplianceRecord,
  ComplianceRepository,
} from '../../../core/ports/compliance-repository.js';

interface ComplianceRow {
  route_id: string;
  target_intensity_gco2e_per_mj: number;
  actual_intensity_gco2e_per_mj: number;
  fuel_consumption_tonnes: number;
  energy_in_scope_mj: number;
  compliance_balance: number;
  percent_difference_from_target: number;
}

const mapResult = (row: ComplianceRow): ComplianceBalanceResult => ({
  targetIntensityGco2ePerMj: row.target_intensity_gco2e_per_mj,
  actualIntensityGco2ePerMj: row.actual_intensity_gco2e_per_mj,
  fuelConsumptionTonnes: row.fuel_consumption_tonnes,
  energyInScopeMj: row.energy_in_scope_mj,
  complianceBalance: row.compliance_balance,
  percentDifferenceFromTarget: row.percent_difference_from_target,
});

export class PgComplianceRepository implements ComplianceRepository {
  public constructor(private readonly pool: Pool) {}

  public async saveForRoute(routeId: string, result: ComplianceBalanceResult): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO route_compliance (
        route_id,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        energy_in_scope_mj,
        compliance_balance,
        percent_difference_from_target
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (route_id) DO UPDATE SET
        target_intensity_gco2e_per_mj = EXCLUDED.target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj = EXCLUDED.actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes = EXCLUDED.fuel_consumption_tonnes,
        energy_in_scope_mj = EXCLUDED.energy_in_scope_mj,
        compliance_balance = EXCLUDED.compliance_balance,
        percent_difference_from_target = EXCLUDED.percent_difference_from_target
      `,
      [
        routeId,
        result.targetIntensityGco2ePerMj,
        result.actualIntensityGco2ePerMj,
        result.fuelConsumptionTonnes,
        result.energyInScopeMj,
        result.complianceBalance,
        result.percentDifferenceFromTarget,
      ],
    );
  }

  public async getByRouteId(routeId: string): Promise<ComplianceBalanceResult | null> {
    const result = await this.pool.query<ComplianceRow>(
      `
      SELECT
        route_id,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        energy_in_scope_mj,
        compliance_balance,
        percent_difference_from_target
      FROM route_compliance
      WHERE route_id = $1
      `,
      [routeId],
    );

    const row = result.rows[0];
    if (result.rowCount === 0 || !row) {
      return null;
    }

    return mapResult(row);
  }

  public async getAll(): Promise<ComplianceRecord[]> {
    const result = await this.pool.query<ComplianceRow>(
      `
      SELECT
        route_id,
        target_intensity_gco2e_per_mj,
        actual_intensity_gco2e_per_mj,
        fuel_consumption_tonnes,
        energy_in_scope_mj,
        compliance_balance,
        percent_difference_from_target
      FROM route_compliance
      ORDER BY route_id
      `,
    );

    return result.rows.map((row) => ({
      routeId: row.route_id,
      result: mapResult(row),
    }));
  }
}
