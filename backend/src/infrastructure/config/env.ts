export interface AppConfig {
  port: number;
  databaseUrl: string;
  persistenceDriver: 'memory' | 'postgres';
  corsOrigin: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  nodeEnv: string;
}

export const loadAppConfig = (): AppConfig => {
  const portRaw = process.env['PORT'] ?? '3001';
  const port = Number(portRaw);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${portRaw}`);
  }

  const logLevelRaw = process.env['LOG_LEVEL'];
  const logLevel =
    logLevelRaw === 'debug' || logLevelRaw === 'info' || logLevelRaw === 'warn' || logLevelRaw === 'error'
      ? logLevelRaw
      : 'info';

  return {
    port,
    databaseUrl:
      process.env['DATABASE_URL'] ?? 'postgres://postgres:postgres@localhost:5432/mariscope',
    persistenceDriver:
      process.env['PERSISTENCE_DRIVER'] === 'postgres' ? 'postgres' : 'memory',
    corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    logLevel,
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
  };
};
