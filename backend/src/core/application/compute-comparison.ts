import { computeComparison } from '../domain/comparison.js';
import { TARGET_INTENSITY_2025 } from '../domain/constants.js';
import type { RouteRepository } from '../ports/route-repository.js';
import { ApplicationError } from './errors/application-error.js';

export interface ComputeComparisonInput {
  year?: number;
}

export interface ComparisonRow {
  routeId: string;
  year: number;
  ghgIntensityGco2ePerMj: number;
  percentDiff: number;
  compliant: boolean;
}

export interface ComputeComparisonOutput {
  baseline: {
    routeId: string;
    year: number;
    ghgIntensityGco2ePerMj: number;
  };
  targetIntensityGco2ePerMj: number;
  comparisons: ComparisonRow[];
}

export class ComputeComparisonUseCase {
  public constructor(private readonly routeRepository: RouteRepository) {}

  public async execute(input?: ComputeComparisonInput): Promise<ComputeComparisonOutput> {
    const routes = await this.routeRepository.getAll(
      input?.year === undefined ? undefined : { year: input.year },
    );

    const baseline = routes.find((route) => route.isBaseline);
    if (!baseline) {
      throw new ApplicationError('No baseline route is configured for comparison');
    }

    const comparisons = routes
      .filter((route) => route.id !== baseline.id)
      .map((route) => {
        const comparison = computeComparison({
          baselineIntensityGco2ePerMj: baseline.ghgIntensityGco2ePerMj,
          comparisonIntensityGco2ePerMj: route.ghgIntensityGco2ePerMj,
        });

        return {
          routeId: route.id,
          year: route.year,
          ghgIntensityGco2ePerMj: route.ghgIntensityGco2ePerMj,
          percentDiff: comparison.percentDiff,
          compliant: comparison.compliant,
        };
      });

    return {
      baseline: {
        routeId: baseline.id,
        year: baseline.year,
        ghgIntensityGco2ePerMj: baseline.ghgIntensityGco2ePerMj,
      },
      targetIntensityGco2ePerMj: TARGET_INTENSITY_2025,
      comparisons,
    };
  }
}
