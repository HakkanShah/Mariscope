import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ComparisonResult } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const ComparePage = () => {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [year, setYear] = useState<string>('2024');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async (selectedYear?: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await frontendUseCases.computeComparison.execute(selectedYear);
      setComparison(result);
    } catch (requestError) {
      setError(formatUserError(requestError));
      setComparison(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComparison(Number(year));
  }, [loadComparison, year]);

  const chartData = useMemo(() => {
    if (!comparison) {
      return [];
    }

    return [
      {
        route: comparison.baseline.routeId,
        ghgIntensity: Number(comparison.baseline.ghgIntensityGco2ePerMj.toFixed(3)),
      },
      ...comparison.comparisons.map((row) => ({
        route: row.routeId,
        ghgIntensity: Number(row.ghgIntensityGco2ePerMj.toFixed(3)),
      })),
    ];
  }, [comparison]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Compare</h2>
          <p className="text-sm text-slate-600 md:text-base">
            Compare route GHG intensity values against the selected baseline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void loadComparison(Number(year));
            }}
            className="button-muted"
          >
            Reload
          </button>
        </div>
      </div>

      {error ? (
        <AlertBanner title="Comparison failed" message={error} variant="error" onDismiss={() => setError(null)} />
      ) : null}
      {loading ? <LoadingBlock label="Loading comparison data..." /> : null}

      {!loading && comparison ? (
        <>
          <div className="section-card space-y-1 text-sm text-slate-700">
            <p>
              Baseline Route: <span className="font-semibold text-slate-900">{comparison.baseline.routeId}</span>
            </p>
            <p>
              Baseline Intensity:{' '}
              <span className="font-semibold text-slate-900">
                {comparison.baseline.ghgIntensityGco2ePerMj.toFixed(3)} gCO2e/MJ
              </span>
            </p>
            <p>
              Target Intensity:{' '}
              <span className="font-semibold text-cyan-800">
                {comparison.targetIntensityGco2ePerMj.toFixed(4)} gCO2e/MJ
              </span>
            </p>
          </div>

          <div className="section-card h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ghgIntensity" fill="#0e7490" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-card overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">GHG Intensity</th>
                  <th className="px-3 py-2">% Difference</th>
                  <th className="px-3 py-2">Compliant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {comparison.comparisons.map((row) => (
                  <tr key={row.routeId}>
                    <td className="px-3 py-2">{row.routeId}</td>
                    <td className="px-3 py-2">{row.ghgIntensityGco2ePerMj.toFixed(3)}</td>
                    <td className={`px-3 py-2 ${row.percentDiff <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {row.percentDiff.toFixed(3)}%
                    </td>
                    <td className="px-3 py-2">{row.compliant ? '?' : '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {!loading && !comparison && !error ? (
        <div className="section-card text-sm text-slate-600">No comparison data available.</div>
      ) : null}
    </div>
  );
};
