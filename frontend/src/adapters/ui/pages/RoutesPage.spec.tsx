import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

    expect((await screen.findAllByText('R001')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('R002').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Vessel Type'), {
      target: { value: 'Container' },
    });

    await waitFor(() => {
      expect(screen.getAllByText('R001').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('R002')).toHaveLength(0);
    });
  });

  it('calls setBaseline when clicking action button', async () => {
    render(<RoutesPage />);

    await screen.findAllByText('R002');

    const row = within(screen.getByRole('table')).getByText('R002').closest('tr');
    if (!row) {
      throw new Error('Expected R002 row');
    }

    fireEvent.click(within(row).getByRole('button', { name: 'Set Baseline' }));

    await waitFor(() => {
      expect(mockedUseCases.setBaselineExecute).toHaveBeenCalledWith('R002');
    });
  });
});
