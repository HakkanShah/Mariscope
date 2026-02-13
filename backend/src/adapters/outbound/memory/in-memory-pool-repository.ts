import type { PoolAdjustmentResult } from '../../../core/domain/pooling.js';
import type { PoolRepository, SavedPoolResult } from '../../../core/ports/pool-repository.js';

interface StoredPool {
  id: string;
  year: number;
  createdAt: string;
  entries: PoolAdjustmentResult[];
}

export class InMemoryPoolRepository implements PoolRepository {
  private readonly pools: StoredPool[] = [];

  public savePoolResult(year: number, entries: PoolAdjustmentResult[]): Promise<SavedPoolResult> {
    const now = new Date().toISOString();
    const pool: StoredPool = {
      id: `pool-${this.pools.length + 1}`,
      year,
      createdAt: now,
      entries,
    };

    this.pools.push(pool);

    return Promise.resolve({
      poolId: pool.id,
      year: pool.year,
      createdAt: pool.createdAt,
    });
  }
}
