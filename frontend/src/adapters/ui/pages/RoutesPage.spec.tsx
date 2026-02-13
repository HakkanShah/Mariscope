import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RouteModel } from '../../../core/domain';
import { RoutesPage } from './RoutesPage';

const mockedUseCases = vi.hoisted(() => ({
  getRoutesExecute: vi.fn(),
  setBaselineExecute: vi.fn(),
}));

vi.mock('../../infrastructure/api/use-cases', () => ({
  frontendUseCases: {
    getRoutes: {
      execute: mockedUseCases.getRoutesExecute,
    },
    setBaseline: {
      execute: mockedUseCases.setBaselineExecute,
    },
  },
}));

const routesFixture: RouteModel[] = [
  {
    id: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensityGco2ePerMj: 91,
    fuelConsumptionTonnes: 5000,
    distanceKm: 12000,
    totalEmissionsTonnes: 4500,
    isBaseline: true,
  },
  {
    id: 'R002',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensityGco2ePerMj: 88,
    fuelConsumptionTonnes: 4800,
    distanceKm: 11500,
    totalEmissionsTonnes: 4200,
    isBaseline: false,
  },
];

describe('RoutesPage', () => {
  beforeEach(() => {
    mockedUseCases.getRoutesExecute.mockReset();
    mockedUseCases.setBaselineExecute.mockReset();

    mockedUseCases.getRoutesExecute.mockResolvedValue(routesFixture);
    mockedUseCases.setBaselineExecute.mockResolvedValue({
      ...routesFixture[1],
      isBaseline: true,
    });
  });

  it('renders routes and applies vessel filter', async () => {
    render(<RoutesPage />);

    expect(await screen.findByText('R001')).toBeInTheDocument();
    expect(screen.getByText('R002')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Vessel Type'), {
      target: { value: 'Container' },
    });

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
      expect(screen.queryByText('R002')).not.toBeInTheDocument();
    });
  });

  it('calls setBaseline when clicking action button', async () => {
    render(<RoutesPage />);

    await screen.findByText('R002');

    fireEvent.click(screen.getAllByRole('button', { name: 'Set Baseline' }).find((button) => !button.hasAttribute('disabled')) as HTMLButtonElement);

    await waitFor(() => {
      expect(mockedUseCases.setBaselineExecute).toHaveBeenCalledWith('R002');
    });
  });
});
