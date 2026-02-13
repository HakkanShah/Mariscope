import type { Pool } from 'pg';

import type { PoolAdjustmentResult } from '../../../core/domain/pooling.js';
import type { PoolRepository, SavedPoolResult } from '../../../core/ports/pool-repository.js';

interface PoolRunRow {
  id: string;
  year: number;
  created_at: Date;
}

export class PgPoolRepository implements PoolRepository {
  public constructor(private readonly pool: Pool) {}

  public async savePoolResult(year: number, entries: PoolAdjustmentResult[]): Promise<SavedPoolResult> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const run = await client.query<PoolRunRow>(
        `
        INSERT INTO pools (year)
        VALUES ($1)
        RETURNING id, year, created_at
        `,
        [year],
      );

      const runRow = run.rows[0];
      if (!runRow) {
        throw new Error('Failed to create pool run');
      }

      const poolId = runRow.id;

      for (const entry of entries) {
        await client.query(
          `
          INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
          VALUES ($1, $2, $3, $4)
          `,
          [poolId, entry.shipId, entry.cbBefore, entry.cbAfter],
        );
      }

      await client.query('COMMIT');

      return {
        poolId,
        year: runRow.year,
        createdAt: runRow.created_at.toISOString(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
