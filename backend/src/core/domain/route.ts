import { ENERGY_FACTOR_MJ_PER_TONNE } from './constants.js';
import { DomainValidationError } from './errors/domain-validation-error.js';

export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO';

export interface RouteProps {
  id: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensityGco2ePerMj: number;
  fuelConsumptionTonnes: number;
  distanceKm: number;
  totalEmissionsTonnes: number;
  isBaseline: boolean;
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

const validatePositiveInteger = (value: number, fieldName: string): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new DomainValidationError(`${fieldName} must be a positive integer`);
  }
};

export class Route {
  private constructor(private readonly props: RouteProps) {}

  public static create(props: RouteProps): Route {
    validateNonEmptyText(props.id, 'Route id');
    validatePositiveInteger(props.year, 'Year');
    validateNonNegativeNumber(props.ghgIntensityGco2ePerMj, 'GHG intensity');
    validateNonNegativeNumber(props.fuelConsumptionTonnes, 'Fuel consumption');
    validateNonNegativeNumber(props.distanceKm, 'Distance');
    validateNonNegativeNumber(props.totalEmissionsTonnes, 'Total emissions');

    return new Route({
      id: props.id.trim(),
      vesselType: props.vesselType,
      fuelType: props.fuelType,
      year: props.year,
      ghgIntensityGco2ePerMj: props.ghgIntensityGco2ePerMj,
      fuelConsumptionTonnes: props.fuelConsumptionTonnes,
      distanceKm: props.distanceKm,
      totalEmissionsTonnes: props.totalEmissionsTonnes,
      isBaseline: props.isBaseline,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get vesselType(): VesselType {
    return this.props.vesselType;
  }

  public get fuelType(): FuelType {
    return this.props.fuelType;
  }

  public get year(): number {
    return this.props.year;
  }

  public get ghgIntensityGco2ePerMj(): number {
    return this.props.ghgIntensityGco2ePerMj;
  }

  public get fuelConsumptionTonnes(): number {
    return this.props.fuelConsumptionTonnes;
  }

  public get distanceKm(): number {
    return this.props.distanceKm;
  }

  public get totalEmissionsTonnes(): number {
    return this.props.totalEmissionsTonnes;
  }

  public get isBaseline(): boolean {
    return this.props.isBaseline;
  }

  public withIsBaseline(isBaseline: boolean): Route {
    return Route.create({
      ...this.props,
      isBaseline,
    });
  }

  public energyInScopeMj(): number {
    return this.props.fuelConsumptionTonnes * ENERGY_FACTOR_MJ_PER_TONNE;
  }

  public toPrimitives(): RouteProps {
    return { ...this.props };
  }
}
