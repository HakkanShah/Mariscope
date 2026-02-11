import { ApiError } from '../../../shared/errors/api-error';

interface ErrorPayload {
  message?: string;
  requestId?: string;
}

export class HttpClient {
  public constructor(private readonly baseUrl: string) {}

  private async parseResponse<TResponse>(
    response: Response,
    method: string,
    path: string,
  ): Promise<TResponse> {
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      let requestId: string | undefined;

      try {
        const body = (await response.json()) as ErrorPayload;
        if (typeof body.message === 'string' && body.message.length > 0) {
          message = body.message;
        }
        requestId = body.requestId;
      } catch {
        // Ignore JSON parsing issues and keep default message.
      }

      const error = new ApiError(message, {
        method,
        path,
        statusCode: response.status,
        requestId,
        details: undefined,
      });

      console.error('[frontend][api-error]', {
        method,
        path,
        statusCode: response.status,
        requestId,
        message,
      });

      throw error;
    }

    return (await response.json()) as TResponse;
  }

  public async get<TResponse>(path: string): Promise<TResponse> {
    const startedAt = performance.now();
    console.info('[frontend][api-request]', { method: 'GET', path });

    try {
      const response = await fetch(`${this.baseUrl}${path}`);
      const data = await this.parseResponse<TResponse>(response, 'GET', path);
      console.info('[frontend][api-success]', {
        method: 'GET',
        path,
        durationMs: Math.round(performance.now() - startedAt),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[frontend][api-network-error]', {
        method: 'GET',
        path,
        error,
      });
      throw new ApiError('Network error while contacting backend', {
        method: 'GET',
        path,
        statusCode: undefined,
        requestId: undefined,
        details: undefined,
      });
    }
  }

  public async post<TResponse, TBody extends object>(path: string, body: TBody): Promise<TResponse> {
    const startedAt = performance.now();
    console.info('[frontend][api-request]', { method: 'POST', path, body });

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await this.parseResponse<TResponse>(response, 'POST', path);
      console.info('[frontend][api-success]', {
        method: 'POST',
        path,
        durationMs: Math.round(performance.now() - startedAt),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[frontend][api-network-error]', {
        method: 'POST',
        path,
        error,
      });
      throw new ApiError('Network error while contacting backend', {
        method: 'POST',
        path,
        statusCode: undefined,
        requestId: undefined,
        details: undefined,
      });
    }
  }
}
