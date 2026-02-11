import { startServer } from './infrastructure/server.js';
import { logger } from './shared/logger.js';

const bootstrap = async (): Promise<void> => {
  try {
    await startServer();
  } catch (error) {
    logger.error('server.bootstrap.failed', {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
    });
    process.exitCode = 1;
  }
};

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('process.unhandledRejection', {
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : String(reason),
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('process.uncaughtException', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

void bootstrap();
