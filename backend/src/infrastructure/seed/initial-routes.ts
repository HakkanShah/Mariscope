import type { RouteProps } from '../../core/domain/route.js';

export const INITIAL_ROUTES: RouteProps[] = [
  {
    id: 'route-1',
    name: 'North Sea Corridor',
    fuelConsumptionTonnes: 100,
    actualIntensityGco2ePerMj: 85.2,
    baselineIntensityGco2ePerMj: 87,
  },
  {
    id: 'route-2',
    name: 'Baltic Trade Lane',
    fuelConsumptionTonnes: 95,
    actualIntensityGco2ePerMj: 91.8,
    baselineIntensityGco2ePerMj: null,
  },
  {
    id: 'route-3',
    name: 'Atlantic Loop',
    fuelConsumptionTonnes: 130,
    actualIntensityGco2ePerMj: 93.4,
    baselineIntensityGco2ePerMj: null,
  },
  {
    id: 'route-4',
    name: 'Mediterranean Shuttle',
    fuelConsumptionTonnes: 80,
    actualIntensityGco2ePerMj: 88.1,
    baselineIntensityGco2ePerMj: null,
  },
  {
    id: 'route-5',
    name: 'Iberian Connector',
    fuelConsumptionTonnes: 110,
    actualIntensityGco2ePerMj: 90.6,
    baselineIntensityGco2ePerMj: null,
  },
];

