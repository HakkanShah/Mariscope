import type { Pool } from 'pg';

import type { BankRepository } from '../../../core/ports/bank-repository.js';

interface BankRow {
  banked_amount: number;
}

export class PgBankRepository implements BankRepository {
  public constructor(private readonly pool: Pool) {}

  public async getBankedAmount(routeId: string): Promise<number> {
    const result = await this.pool.query<BankRow>(
      `
      SELECT banked_amount
      FROM route_banks
      WHERE route_id = $1
      `,
      [routeId],
    );

    const row = result.rows[0];
    if (result.rowCount === 0 || !row) {
      return 0;
    }

    return row.banked_amount;
  }

  public async setBankedAmount(routeId: string, amount: number): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO route_banks (route_id, banked_amount)
      VALUES ($1, $2)
      ON CONFLICT (route_id) DO UPDATE SET
        banked_amount = EXCLUDED.banked_amount
      `,
      [routeId, amount],
    );
  }
}
