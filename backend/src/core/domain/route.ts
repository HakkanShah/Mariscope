import { ENERGY_FACTOR_MJ_PER_TONNE } from './constants.js';
import { DomainValidationError } from './errors/domain-validation-error.js';

export interface RouteProps {
  id: string;
  name: string;
  fuelConsumptionTonnes: number;
  actualIntensityGco2ePerMj: number;
  baselineIntensityGco2ePerMj?: number | null;
}

const validateNonEmptyText = (value: string, fieldName: string): void => {
  if (value.trim().length === 0) {
    throw new DomainValidationError(`${fieldName} must not be empty`);
  }
};

const validateNonNegativeNumber = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`${fieldName} must be a finite non-negative number`);
  }
};

export class Route {
  private constructor(private readonly props: RouteProps) {}

  public static create(props: RouteProps): Route {
    validateNonEmptyText(props.id, 'Route id');
    validateNonEmptyText(props.name, 'Route name');
    validateNonNegativeNumber(props.fuelConsumptionTonnes, 'Fuel consumption');
    validateNonNegativeNumber(props.actualIntensityGco2ePerMj, 'Actual intensity');

    if (props.baselineIntensityGco2ePerMj != null) {
      validateNonNegativeNumber(props.baselineIntensityGco2ePerMj, 'Baseline intensity');
    }

    return new Route({
      id: props.id.trim(),
      name: props.name.trim(),
      fuelConsumptionTonnes: props.fuelConsumptionTonnes,
      actualIntensityGco2ePerMj: props.actualIntensityGco2ePerMj,
      baselineIntensityGco2ePerMj: props.baselineIntensityGco2ePerMj ?? null,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get fuelConsumptionTonnes(): number {
    return this.props.fuelConsumptionTonnes;
  }

  public get actualIntensityGco2ePerMj(): number {
    return this.props.actualIntensityGco2ePerMj;
  }

  public get baselineIntensityGco2ePerMj(): number | null {
    return this.props.baselineIntensityGco2ePerMj ?? null;
  }

  public withBaselineIntensity(baselineIntensityGco2ePerMj: number): Route {
    validateNonNegativeNumber(baselineIntensityGco2ePerMj, 'Baseline intensity');

    return Route.create({
      ...this.props,
      baselineIntensityGco2ePerMj,
    });
  }

  public energyInScopeMj(): number {
    return this.props.fuelConsumptionTonnes * ENERGY_FACTOR_MJ_PER_TONNE;
  }

  public toPrimitives(): RouteProps {
    return { ...this.props };
  }
}

