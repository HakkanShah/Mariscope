export interface ApiErrorContext {
  method: string;
  path: string;
  statusCode: number | undefined;
  requestId: string | undefined;
  details: string | undefined;
}

export class ApiError extends Error {
  public readonly method: string;
  public readonly path: string;
  public readonly statusCode: number | undefined;
  public readonly requestId: string | undefined;
  public readonly details: string | undefined;

  public constructor(message: string, context: ApiErrorContext) {
    super(message);
    this.name = 'ApiError';
    this.method = context.method;
    this.path = context.path;
    this.statusCode = context.statusCode;
    this.requestId = context.requestId;
    this.details = context.details;
  }
}
