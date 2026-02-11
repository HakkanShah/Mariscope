export interface AppConfig {
  port: number;
  databaseUrl: string;
  persistenceDriver: 'memory' | 'postgres';
  corsOrigin: string;
}

export const loadAppConfig = (): AppConfig => {
  const portRaw = process.env['PORT'] ?? '3001';
  const port = Number(portRaw);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${portRaw}`);
  }

  return {
    port,
    databaseUrl:
      process.env['DATABASE_URL'] ?? 'postgres://postgres:postgres@localhost:5432/mariscope',
    persistenceDriver:
      process.env['PERSISTENCE_DRIVER'] === 'postgres' ? 'postgres' : 'memory',
    corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  };
};
