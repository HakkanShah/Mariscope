import type { Pool } from 'pg';

import type { BankRecord, BankRepository, SaveBankRecordInput } from '../../../core/ports/bank-repository.js';

interface BankRecordRow {
  id: number;
  ship_id: string;
  year: number;
  entry_type: 'bank' | 'apply';
  amount_gco2eq: number;
  created_at: Date;
}

export class PgBankRepository implements BankRepository {
  public constructor(private readonly pool: Pool) {}

  public async getBankedAmount(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query<{ banked_total: number }>(
      `
      SELECT COALESCE(SUM(CASE WHEN entry_type = 'bank' THEN amount_gco2eq ELSE -amount_gco2eq END), 0) AS banked_total
      FROM bank_entries
      WHERE ship_id = $1 AND year = $2
      `,
      [shipId, year],
    );

    const total = result.rows[0]?.banked_total ?? 0;
    return total > 0 ? total : 0;
  }

  public async saveRecord(input: SaveBankRecordInput): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO bank_entries (ship_id, year, entry_type, amount_gco2eq)
      VALUES ($1, $2, $3, $4)
      `,
      [input.shipId, input.year, input.entryType, input.amount],
    );
  }

  public async getRecords(filters?: { shipId?: string; year?: number }): Promise<BankRecord[]> {
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

    const result = await this.pool.query<BankRecordRow>(
      `
      SELECT
        id,
        ship_id,
        year,
        entry_type,
        amount_gco2eq,
        created_at
      FROM bank_entries
      ${whereClause}
      ORDER BY created_at ASC, id ASC
      `,
      values,
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      shipId: row.ship_id,
      year: row.year,
      entryType: row.entry_type,
      amount: row.amount_gco2eq,
      createdAt: row.created_at.toISOString(),
    }));
  }

  public async getAppliedAmount(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query<{ total_applied: number }>(
      `
      SELECT COALESCE(SUM(amount_gco2eq), 0) AS total_applied
      FROM bank_entries
      WHERE ship_id = $1 AND year = $2 AND entry_type = 'apply'
      `,
      [shipId, year],
    );

    return result.rows[0]?.total_applied ?? 0;
  }
}
