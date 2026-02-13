export interface PoolEntry {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolResponse {
  poolId: string;
  year: number;
  createdAt: string;
  poolSumBefore: number;
  poolSumAfter: number;
  entries: PoolEntry[];
}
