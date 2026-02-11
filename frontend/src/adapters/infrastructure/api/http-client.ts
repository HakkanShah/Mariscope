export class HttpClient {
  public constructor(private readonly baseUrl: string) {}

  private async parseResponse<TResponse>(response: Response): Promise<TResponse> {
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) {
          message = body.message;
        }
      } catch {
        // Ignore JSON parsing issues and keep default message.
      }
      throw new Error(message);
    }

    return (await response.json()) as TResponse;
  }

  public async get<TResponse>(path: string): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`);
    return this.parseResponse<TResponse>(response);
  }

  public async post<TResponse, TBody extends object>(path: string, body: TBody): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return this.parseResponse<TResponse>(response);
  }
}
