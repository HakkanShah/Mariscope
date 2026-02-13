import type { PoolAdjustmentResult } from '../domain/pooling.js';

export interface SavedPoolResult {
  poolId: string;
  year: number;
  createdAt: string;
}

export interface PoolRepository {
  savePoolResult(year: number, entries: PoolAdjustmentResult[]): Promise<SavedPoolResult>;
}
