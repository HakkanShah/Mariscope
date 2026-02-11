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

export const mapErrorToHttp = (error: unknown): { statusCode: number; message: string } => {
  if (error instanceof DomainValidationError) {
    return { statusCode: 400, message: error.message };
  }

  if (error instanceof NotFoundError) {
    return { statusCode: 404, message: error.message };
  }

  if (error instanceof ApplicationError) {
    return { statusCode: 400, message: error.message };
  }

  return {
    statusCode: 500,
    message: 'Internal server error',
  };
};

