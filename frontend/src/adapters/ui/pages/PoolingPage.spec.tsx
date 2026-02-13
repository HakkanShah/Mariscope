import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdjustedComplianceRecord, CreatePoolResponse } from '../../../core/domain';
import { PoolingPage } from './PoolingPage';

const mockedUseCases = vi.hoisted(() => ({
  getAdjustedCBExecute: vi.fn(),
  createPoolExecute: vi.fn(),
}));

vi.mock('../../infrastructure/api/use-cases', () => ({
  frontendUseCases: {
    getAdjustedCB: {
      execute: mockedUseCases.getAdjustedCBExecute,
    },
    createPool: {
      execute: mockedUseCases.createPoolExecute,
    },
  },
}));

const adjustedFixture: AdjustedComplianceRecord[] = [
  {
    shipId: 'SHIP-A',
    year: 2024,
    cbBefore: 300,
    applied: 0,
    adjustedCb: 300,
  },
  {
    shipId: 'SHIP-B',
    year: 2024,
    cbBefore: -200,
    applied: 80,
    adjustedCb: -120,
  },
];

const poolFixture: CreatePoolResponse = {
  poolId: 'POOL-1',
  year: 2024,
  createdAt: '2026-02-13T10:00:00.000Z',
  poolSumBefore: 180,
  poolSumAfter: 180,
  entries: [
    { shipId: 'SHIP-A', cbBefore: 300, cbAfter: 200 },
    { shipId: 'SHIP-B', cbBefore: -120, cbAfter: -20 },
  ],
};

describe('PoolingPage', () => {
  beforeEach(() => {
    mockedUseCases.getAdjustedCBExecute.mockReset();
    mockedUseCases.createPoolExecute.mockReset();

    mockedUseCases.getAdjustedCBExecute.mockResolvedValue(adjustedFixture);
    mockedUseCases.createPoolExecute.mockResolvedValue(poolFixture);
  });

  it('creates a pool with selected ships', async () => {
    render(<PoolingPage />);

    expect((await screen.findAllByText('SHIP-A')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('SHIP-B').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Create Pool' }));

    await waitFor(() => {
      expect(mockedUseCases.createPoolExecute).toHaveBeenCalledWith(2024, ['SHIP-A', 'SHIP-B']);
    });
  });

  it('shows validation message when selected ships produce negative sum', async () => {
    render(<PoolingPage />);

    await screen.findAllByText('SHIP-A');

    const shipARow = within(screen.getByRole('table')).getByText('SHIP-A').closest('tr');
    if (!shipARow) {
      throw new Error('Expected SHIP-A row to be present');
    }

    fireEvent.click(within(shipARow).getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: 'Create Pool' }));

    await waitFor(() => {
      expect(
        screen.getByText('Pool sum is negative. Remove deficit-heavy ships until Pool Sum is non-negative.'),
      ).toBeInTheDocument();
    });

    expect(mockedUseCases.createPoolExecute).toHaveBeenCalledTimes(0);
  });
});
