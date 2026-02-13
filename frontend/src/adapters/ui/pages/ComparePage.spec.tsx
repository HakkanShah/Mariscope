import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ComparisonResult, RouteModel } from '../../../core/domain';
import { ComparePage } from './ComparePage';

const mockedUseCases = vi.hoisted(() => ({
  computeComparisonExecute: vi.fn(),
  getRoutesExecute: vi.fn(),
}));

vi.mock('../../infrastructure/api/use-cases', () => ({
  frontendUseCases: {
    computeComparison: {
      execute: mockedUseCases.computeComparisonExecute,
    },
    getRoutes: {
      execute: mockedUseCases.getRoutesExecute,
    },
  },
}));

const routesFixture: RouteModel[] = [
  {
    id: 'R-101',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensityGco2ePerMj: 88.12,
    fuelConsumptionTonnes: 1000,
    distanceKm: 1000,
    totalEmissionsTonnes: 800,
    isBaseline: true,
  },
  {
    id: 'R-202',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2025,
    ghgIntensityGco2ePerMj: 92.33,
    fuelConsumptionTonnes: 1200,
    distanceKm: 1300,
    totalEmissionsTonnes: 950,
    isBaseline: false,
  },
];

const comparisonFixture: ComparisonResult = {
  baseline: {
    routeId: 'BL-001',
    year: 2024,
    ghgIntensityGco2ePerMj: 88.12,
  },
  targetIntensityGco2ePerMj: 89.3368,
  comparisons: [
    {
      routeId: 'R-101',
      year: 2024,
      ghgIntensityGco2ePerMj: 88.12,
      percentDiff: -1.24,
      compliant: true,
    },
    {
      routeId: 'R-202',
      year: 2024,
      ghgIntensityGco2ePerMj: 92.33,
      percentDiff: 3.35,
      compliant: false,
    },
  ],
};

describe('ComparePage', () => {
  beforeEach(() => {
    mockedUseCases.getRoutesExecute.mockReset();
    mockedUseCases.computeComparisonExecute.mockReset();
    mockedUseCases.getRoutesExecute.mockResolvedValue(routesFixture);
    mockedUseCases.computeComparisonExecute.mockResolvedValue(comparisonFixture);
  });

  it('renders comparison rows with compliance status labels', async () => {
    render(<ComparePage />);

    expect(await screen.findByText('R-101')).toBeInTheDocument();
    expect(screen.getByText('R-202')).toBeInTheDocument();
    expect(screen.getAllByText('Compliant').length).toBeGreaterThan(0);
    expect(screen.getByText('Non-compliant')).toBeInTheDocument();
  });

  it('shows a baseline guidance message for years without baseline', async () => {
    render(<ComparePage />);
    await screen.findByText('R-101');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2025' },
    });

    await waitFor(() => {
      expect(
        screen.getByText('No baseline route is configured for 2025. Set baseline in Routes first.'),
      ).toBeInTheDocument();
    });

    expect(mockedUseCases.computeComparisonExecute).not.toHaveBeenCalledWith(2025);
  });
});
