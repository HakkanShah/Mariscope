import type { RouteProps } from '../domain/route.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { NotFoundError } from './errors/application-error.js';

export interface SetBaselineInput {
  routeId: string;
}

export class SetBaselineUseCase {
  public constructor(private readonly routeRepository: RouteRepository) {}

  public async execute(input: SetBaselineInput): Promise<RouteProps> {
    const route = await this.routeRepository.getById(input.routeId);
    if (!route) {
      throw new NotFoundError(`Route not found: ${input.routeId}`);
    }

    const sameYearRoutes = await this.routeRepository.getAll({ year: route.year });

    for (const currentRoute of sameYearRoutes) {
      const next = currentRoute.withIsBaseline(currentRoute.id === route.id);
      await this.routeRepository.save(next);
    }

    const updated = await this.routeRepository.getById(route.id);
    if (!updated) {
      throw new NotFoundError(`Route not found after baseline update: ${route.id}`);
    }

    return updated.toPrimitives();
  }
}
