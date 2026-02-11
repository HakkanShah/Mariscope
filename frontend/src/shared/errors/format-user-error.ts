import { ApiError } from './api-error';

export const formatUserError = (error: unknown): string => {
  if (error instanceof ApiError) {
    const requestSuffix = error.requestId ? ` (Request: ${error.requestId})` : '';
    return `${error.message}${requestSuffix}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

