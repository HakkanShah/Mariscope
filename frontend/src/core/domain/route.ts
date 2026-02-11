export interface RouteModel {
  id: string;
  name: string;
  fuelConsumptionTonnes: number;
  actualIntensityGco2ePerMj: number;
  baselineIntensityGco2ePerMj: number | null;
}

