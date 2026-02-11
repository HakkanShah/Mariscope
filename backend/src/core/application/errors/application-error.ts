export class ApplicationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class NotFoundError extends ApplicationError {
  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

