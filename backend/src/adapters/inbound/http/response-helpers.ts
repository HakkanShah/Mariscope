import { type NextFunction, type Request, type Response } from 'express';

import { ApplicationError, NotFoundError } from '../../../core/application/index.js';
import { DomainValidationError } from '../../../core/domain/index.js';

export type AsyncRequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler = (handler: AsyncRequestHandler) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    void handler(request, response, next).catch(next);
  };
};

export interface HttpMappedError {
  statusCode: number;
  message: string;
  exposeDetails: boolean;
}

export const mapErrorToHttp = (error: unknown): HttpMappedError => {
  if (error instanceof DomainValidationError) {
    return { statusCode: 400, message: error.message, exposeDetails: true };
  }

  if (error instanceof NotFoundError) {
    return { statusCode: 404, message: error.message, exposeDetails: true };
  }

  if (error instanceof ApplicationError) {
    return { statusCode: 400, message: error.message, exposeDetails: true };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      message: 'Invalid JSON payload',
      exposeDetails: true,
    };
  }

  return {
    statusCode: 500,
    message: 'Internal server error',
    exposeDetails: false,
  };
};

export const serializeUnknownError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: String(error),
  };
};
