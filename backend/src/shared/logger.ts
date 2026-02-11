type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const normalizeLevel = (value: string | undefined): LogLevel => {
  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
    return value;
  }
  return 'info';
};

const globalLevel = normalizeLevel(process.env['LOG_LEVEL']);

const shouldLog = (level: LogLevel): boolean => {
  return levelPriority[level] >= levelPriority[globalLevel];
};

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>): void => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
};

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>): void => writeLog('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>): void => writeLog('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => writeLog('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => writeLog('error', message, meta),
};

