import type { PoolAdjustmentResult } from '../domain/pooling.js';

export interface SavedPoolResult {
  poolId: string;
  createdAt: string;
}

export interface PoolRepository {
  savePoolResult(entries: PoolAdjustmentResult[]): Promise<SavedPoolResult>;
}

