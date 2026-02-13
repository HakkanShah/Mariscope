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
  const [year, setYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [baselineYears, setBaselineYears] = useState<number[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadYearMetadata = useCallback(async () => {
    try {
      setMetaLoading(true);
      setError(null);

      const routes = await frontendUseCases.getRoutes.execute();
      const years = Array.from(new Set(routes.map((route) => route.year))).sort((a, b) => a - b);
      const yearsWithBaseline = Array.from(
        new Set(routes.filter((route) => route.isBaseline).map((route) => route.year)),
      ).sort((a, b) => a - b);

      setAvailableYears(years);
      setBaselineYears(yearsWithBaseline);

      const preferredYear = yearsWithBaseline[0] ?? years[0];
      setYear((current) => {
        if (current.length > 0 && years.includes(Number(current))) {
          return current;
        }

        return preferredYear === undefined ? '' : String(preferredYear);
      });
    } catch (requestError) {
      setAvailableYears([]);
      setBaselineYears([]);
      setYear('');
      setComparison(null);
      setError(formatUserError(requestError));
    } finally {
      setMetaLoading(false);
    }
  }, []);

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
    void loadYearMetadata();
  }, [loadYearMetadata]);

  useEffect(() => {
    if (metaLoading) {
      return;
    }

    if (year.length === 0) {
      setLoading(false);
      setComparison(null);
      return;
    }

    const selectedYear = Number(year);
    if (!baselineYears.includes(selectedYear)) {
      setLoading(false);
      setComparison(null);
      setError(`No baseline route is configured for ${selectedYear}. Set baseline in Routes first.`);
      return;
    }

    void loadComparison(selectedYear);
  }, [baselineYears, loadComparison, metaLoading, year]);

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
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm sm:w-auto"
            disabled={metaLoading || availableYears.length === 0}
          >
            {availableYears.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {baselineYears.includes(yearOption)
                  ? String(yearOption)
                  : `${yearOption} (set baseline first)`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              void loadYearMetadata();
            }}
            className="button-muted w-full sm:w-auto"
            disabled={metaLoading}
          >
            Reload
          </button>
        </div>
      </div>

      {error ? (
        <AlertBanner title="Comparison failed" message={error} variant="error" onDismiss={() => setError(null)} />
      ) : null}
      {metaLoading || loading ? <LoadingBlock label="Loading comparison data..." /> : null}

      {!metaLoading && !loading && comparison ? (
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

          <div className="section-card h-64 w-full md:h-80">
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

          <div className="space-y-3 md:hidden">
            {comparison.comparisons.map((row) => (
              <article key={row.routeId} className="section-card space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{row.routeId}</p>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      row.compliant
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {row.compliant ? 'Compliant' : 'Non-compliant'}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <dt>GHG Intensity</dt>
                    <dd className="font-semibold text-slate-900">{row.ghgIntensityGco2ePerMj.toFixed(3)}</dd>
                  </div>
                  <div>
                    <dt>% Difference</dt>
                    <dd className={`font-semibold ${row.percentDiff <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {row.percentDiff.toFixed(3)}%
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="section-card hidden overflow-x-auto md:block">
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
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          row.compliant
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.compliant ? 'Compliant' : 'Non-compliant'}
                      </span>
                    </td>
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
