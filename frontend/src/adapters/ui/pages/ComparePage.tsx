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

import type { ComplianceRouteRecord } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const ComparePage = () => {
  const [rows, setRows] = useState<ComplianceRouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.info('[frontend][compare] compliance computation requested');
      const data = await frontendUseCases.computeCB.execute();
      setRows(data);
      console.info('[frontend][compare] compliance rows loaded', { count: data.length });
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][compare] compliance load failed', { message, requestError });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompliance();
  }, [loadCompliance]);

  const chartData = useMemo(() => {
    return rows.map((row) => ({
      route: row.routeName,
      actual: Number(row.actualIntensityGco2ePerMj.toFixed(4)),
      target: Number(row.targetIntensityGco2ePerMj.toFixed(4)),
      cb: Number(row.complianceBalance.toFixed(2)),
    }));
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Compare</h2>
          <p className="text-sm text-slate-600 md:text-base">
            Compare route intensities against FuelEU target and inspect route-level compliance balance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadCompliance();
          }}
          className="button-muted"
        >
          Recompute
        </button>
      </div>

      {error ? <AlertBanner title="Computation failed" message={error} variant="error" onDismiss={() => setError(null)} /> : null}
      {loading ? <LoadingBlock label="Computing compliance balance..." /> : null}

      {!loading && rows.length > 0 ? (
        <>
          <div className="section-card h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#0e7490" />
                <Bar dataKey="target" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-card overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Actual</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">CB</th>
                  <th className="px-3 py-2">% Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((row) => (
                  <tr key={row.routeId}>
                    <td className="px-3 py-2">{row.routeName}</td>
                    <td className="px-3 py-2">{row.actualIntensityGco2ePerMj.toFixed(4)}</td>
                    <td className="px-3 py-2">{row.targetIntensityGco2ePerMj.toFixed(4)}</td>
                    <td
                      className={`px-3 py-2 ${row.complianceBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                    >
                      {row.complianceBalance.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{row.percentDifferenceFromTarget.toFixed(3)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {!loading && rows.length === 0 ? (
        <div className="section-card text-sm text-slate-600">
          No compliance data returned. Check backend connectivity and retry.
        </div>
      ) : null}
    </div>
  );
};
