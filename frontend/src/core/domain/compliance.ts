export interface ComplianceRouteRecord {
  routeId: string;
  routeName: string;
  targetIntensityGco2ePerMj: number;
  actualIntensityGco2ePerMj: number;
  fuelConsumptionTonnes: number;
  energyInScopeMj: number;
  complianceBalance: number;
  percentDifferenceFromTarget: number;
}

