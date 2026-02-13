import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ComparisonResult } from '../../../core/domain';
import { ComparePage } from './ComparePage';

const mockedUseCases = vi.hoisted(() => ({
  computeComparisonExecute: vi.fn(),
}));

vi.mock('../../infrastructure/api/use-cases', () => ({
  frontendUseCases: {
    computeComparison: {
      execute: mockedUseCases.computeComparisonExecute,
    },
  },
}));

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
    mockedUseCases.computeComparisonExecute.mockReset();
    mockedUseCases.computeComparisonExecute.mockResolvedValue(comparisonFixture);
  });

  it('renders comparison rows with compliance status labels', async () => {
    render(<ComparePage />);

    expect(await screen.findByText('R-101')).toBeInTheDocument();
    expect(screen.getByText('R-202')).toBeInTheDocument();
    expect(screen.getAllByText('Compliant').length).toBeGreaterThan(0);
    expect(screen.getByText('Non-compliant')).toBeInTheDocument();
  });

  it('reloads data using the selected year', async () => {
    render(<ComparePage />);
    await screen.findByText('R-101');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2025' },
    });

    await waitFor(() => {
      expect(mockedUseCases.computeComparisonExecute).toHaveBeenLastCalledWith(2025);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

    await waitFor(() => {
      expect(mockedUseCases.computeComparisonExecute).toHaveBeenLastCalledWith(2025);
    });
  });
});
