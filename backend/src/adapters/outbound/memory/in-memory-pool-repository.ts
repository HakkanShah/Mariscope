import type { PoolAdjustmentResult } from '../../../core/domain/pooling.js';
import type { PoolRepository, SavedPoolResult } from '../../../core/ports/pool-repository.js';

interface StoredPool {
  id: string;
  createdAt: string;
  entries: PoolAdjustmentResult[];
}

export class InMemoryPoolRepository implements PoolRepository {
  private readonly pools: StoredPool[] = [];

  public savePoolResult(entries: PoolAdjustmentResult[]): Promise<SavedPoolResult> {
    const now = new Date().toISOString();
    const pool: StoredPool = {
      id: `pool-${this.pools.length + 1}`,
      createdAt: now,
      entries,
    };

    this.pools.push(pool);

    return Promise.resolve({
      poolId: pool.id,
      createdAt: pool.createdAt,
    });
  }
}
