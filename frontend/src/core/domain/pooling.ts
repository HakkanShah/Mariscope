export interface PoolEntry {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolResponse {
  poolId: string;
  createdAt: string;
  entries: PoolEntry[];
}

