import type { CreatePoolResponse } from '../domain';
import type { MariscopeApiPort } from '../ports';

export class CreatePoolUseCase {
  public constructor(private readonly api: MariscopeApiPort) {}

  public execute(year: number, shipIds?: string[]): Promise<CreatePoolResponse> {
    return this.api.createPool(year, shipIds);
  }
}
