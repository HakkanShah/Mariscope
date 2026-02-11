export class HttpClient {
  public constructor(private readonly baseUrl: string) {}

  public async get<TResponse>(path: string): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`GET ${path} failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}

