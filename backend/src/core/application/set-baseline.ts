import type { RouteProps } from '../domain/route.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface SetBaselineInput {
  routeId: string;
  baselineIntensityGco2ePerMj: number;
}

export class SetBaselineUseCase {
  public constructor(private readonly routeRepository: RouteRepository) {}

  public async execute(input: SetBaselineInput): Promise<RouteProps> {
    const route = await this.routeRepository.getById(input.routeId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.routeId}`);
    }

    const updatedRoute = route.withBaselineIntensity(input.baselineIntensityGco2ePerMj);
    await this.routeRepository.save(updatedRoute);
    return updatedRoute.toPrimitives();
  }
}

