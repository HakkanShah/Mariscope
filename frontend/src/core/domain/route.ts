export interface RouteModel {
  id: string;
  vesselType: 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
  fuelType: 'HFO' | 'LNG' | 'MGO';
  year: number;
  ghgIntensityGco2ePerMj: number;
  fuelConsumptionTonnes: number;
  distanceKm: number;
  totalEmissionsTonnes: number;
  isBaseline: boolean;
}

export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}
