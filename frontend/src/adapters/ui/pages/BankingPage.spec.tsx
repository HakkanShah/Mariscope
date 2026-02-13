import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ApplyBankedResponse,
  BankSurplusResponse,
  BankingRecordsResponse,
  ComplianceCBRecord,
  RouteModel,
} from '../../../core/domain';
import { BankingPage } from './BankingPage';

const mockedUseCases = vi.hoisted(() => ({
  getRoutesExecute: vi.fn(),
  computeCBExecute: vi.fn(),
  getBankingRecordsExecute: vi.fn(),
  bankSurplusExecute: vi.fn(),
  applyBankedExecute: vi.fn(),
}));

vi.mock('../../infrastructure/api/use-cases', () => ({
  frontendUseCases: {
    getRoutes: {
      execute: mockedUseCases.getRoutesExecute,
    },
    computeCB: {
      execute: mockedUseCases.computeCBExecute,
    },
    getBankingRecords: {
      execute: mockedUseCases.getBankingRecordsExecute,
    },
    bankSurplus: {
      execute: mockedUseCases.bankSurplusExecute,
    },
    applyBanked: {
      execute: mockedUseCases.applyBankedExecute,
    },
  },
}));

const routesFixture: RouteModel[] = [
  {
    id: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensityGco2ePerMj: 88.9,
    fuelConsumptionTonnes: 1000,
    distanceKm: 5000,
    totalEmissionsTonnes: 900,
    isBaseline: true,
  },
];

const complianceFixture: ComplianceCBRecord[] = [
  {
    shipId: 'SHIP-A',
    year: 2024,
    cb: 250,
    energyInScopeMj: 41_000_000,
    targetIntensityGco2ePerMj: 89.3368,
    actualIntensityGco2ePerMj: 88,
  },
  {
    shipId: 'SHIP-B',
    year: 2024,
    cb: -120,
    energyInScopeMj: 40_500_000,
    targetIntensityGco2ePerMj: 89.3368,
    actualIntensityGco2ePerMj: 91.2,
  },
];

const bankResponseFixture: BankSurplusResponse = {
  shipId: 'SHIP-A',
  year: 2024,
  cbBefore: 250,
  bankedAmount: 50,
  newBankedTotal: 50,
};

const applyResponseFixture: ApplyBankedResponse = {
  shipId: 'SHIP-B',
  year: 2024,
  cbBefore: -120,
  applied: 75,
  cbAfter: -45,
  remainingBankedAmount: 45,
};

describe('BankingPage', () => {
  beforeEach(() => {
    mockedUseCases.getRoutesExecute.mockReset();
    mockedUseCases.computeCBExecute.mockReset();
    mockedUseCases.getBankingRecordsExecute.mockReset();
    mockedUseCases.bankSurplusExecute.mockReset();
    mockedUseCases.applyBankedExecute.mockReset();

    mockedUseCases.getRoutesExecute.mockResolvedValue(routesFixture);
    mockedUseCases.computeCBExecute.mockResolvedValue(complianceFixture);
    mockedUseCases.getBankingRecordsExecute.mockImplementation(
      (): Promise<BankingRecordsResponse> =>
        Promise.resolve({ records: [], currentBankedAmount: 120 }),
    );
    mockedUseCases.bankSurplusExecute.mockResolvedValue(bankResponseFixture);
    mockedUseCases.applyBankedExecute.mockResolvedValue(applyResponseFixture);
  });

  it('banks surplus for the selected ship', async () => {
    render(<BankingPage />);

    await waitFor(() => {
      expect(mockedUseCases.computeCBExecute).toHaveBeenCalledWith({ year: 2024 });
    });

    fireEvent.change(screen.getByLabelText('Amount to bank (optional, defaults to full surplus)'), {
      target: { value: '50' },
    });

    const bankButton = screen.getByRole('button', { name: 'Bank' });
    await waitFor(() => {
      expect(bankButton).toBeEnabled();
    });
    fireEvent.click(bankButton);

    await waitFor(() => {
      expect(mockedUseCases.bankSurplusExecute).toHaveBeenCalledWith('SHIP-A', 50);
    });
  });

  it('applies banked amount for a deficit ship', async () => {
    render(<BankingPage />);

    await waitFor(() => {
      expect(mockedUseCases.computeCBExecute).toHaveBeenCalledWith({ year: 2024 });
    });

    fireEvent.change(screen.getByLabelText('Ship'), {
      target: { value: 'SHIP-B' },
    });

    await waitFor(() => {
      expect(mockedUseCases.getBankingRecordsExecute).toHaveBeenLastCalledWith({
        year: 2024,
      });
    });

    fireEvent.change(screen.getByLabelText('Amount to apply'), {
      target: { value: '75' },
    });

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await waitFor(() => {
      expect(applyButton).toBeEnabled();
    });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockedUseCases.applyBankedExecute).toHaveBeenCalledWith('SHIP-B', 75);
    });
  });

  it('shows guidance message when banking is attempted for non-surplus ship', async () => {
    render(<BankingPage />);

    await waitFor(() => {
      expect(mockedUseCases.computeCBExecute).toHaveBeenCalledWith({ year: 2024 });
    });

    fireEvent.change(screen.getByLabelText('Ship'), {
      target: { value: 'SHIP-B' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Bank' }));

    await waitFor(() => {
      expect(
        screen.getByText('Selected ship has no surplus CB. Choose a ship with positive CB or change year.'),
      ).toBeInTheDocument();
    });

    expect(mockedUseCases.bankSurplusExecute).toHaveBeenCalledTimes(0);
  });
});
