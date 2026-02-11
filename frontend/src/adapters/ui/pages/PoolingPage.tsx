import { useEffect, useState } from 'react';

import type { ComplianceRouteRecord, CreatePoolResponse } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';

export const PoolingPage = () => {
  const [complianceRows, setComplianceRows] = useState<ComplianceRouteRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [poolResult, setPoolResult] = useState<CreatePoolResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompliance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frontendUseCases.computeCB.execute();
      setComplianceRows(data);
      setSelected(
        data.reduce<Record<string, boolean>>((acc, row) => {
          acc[row.routeId] = true;
          return acc;
        }, {}),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompliance();
  }, []);

  const handleCreatePool = async () => {
    const routeIds = Object.entries(selected)
      .filter(([, included]) => included)
      .map(([routeId]) => routeId);

    if (routeIds.length === 0) {
      setError('Select at least one route');
      return;
    }

    try {
      setError(null);
      const result = await frontendUseCases.createPool.execute(routeIds);
      setPoolResult(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create pool');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Pooling</h2>
          <p className="text-sm text-slate-600">
            Build a compliance pool (Article 21) with greedy surplus allocation across selected routes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadCompliance();
          }}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Recompute
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading compliance data...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Include</th>
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2">Current CB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {complianceRows.map((row) => (
                <tr key={row.routeId}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected[row.routeId] ?? false}
                      onChange={(event) => {
                        setSelected((current) => ({
                          ...current,
                          [row.routeId]: event.target.checked,
                        }));
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">{row.routeName}</td>
                  <td className={`px-3 py-2 ${row.complianceBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {row.complianceBalance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void handleCreatePool();
        }}
        className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600"
      >
        Create Pool
      </button>

      {poolResult ? (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Pool {poolResult.poolId} created at {new Date(poolResult.createdAt).toLocaleString()}
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-white text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Ship</th>
                  <th className="px-3 py-2">CB Before</th>
                  <th className="px-3 py-2">CB After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {poolResult.entries.map((entry) => (
                  <tr key={entry.shipId}>
                    <td className="px-3 py-2">{entry.shipId}</td>
                    <td className="px-3 py-2">{entry.cbBefore.toFixed(2)}</td>
                    <td className={`px-3 py-2 ${entry.cbAfter >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {entry.cbAfter.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
