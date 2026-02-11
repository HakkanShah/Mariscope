import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ComplianceRouteRecord, CreatePoolResponse } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const PoolingPage = () => {
  const [complianceRows, setComplianceRows] = useState<ComplianceRouteRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [poolResult, setPoolResult] = useState<CreatePoolResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [poolingInProgress, setPoolingInProgress] = useState(false);

  const loadCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      console.info('[frontend][pooling] loading compliance for pool builder');
      const data = await frontendUseCases.computeCB.execute();
      setComplianceRows(data);
      setSelected(
        data.reduce<Record<string, boolean>>((acc, row) => {
          acc[row.routeId] = true;
          return acc;
        }, {}),
      );
      console.info('[frontend][pooling] compliance rows loaded', { count: data.length });
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][pooling] load failed', { message, requestError });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompliance();
  }, [loadCompliance]);

  const selectedCount = useMemo(() => {
    return Object.values(selected).filter(Boolean).length;
  }, [selected]);

  const handleCreatePool = async () => {
    const routeIds = Object.entries(selected)
      .filter(([, included]) => included)
      .map(([routeId]) => routeId);

    if (routeIds.length === 0) {
      setError('Select at least one route');
      setSuccess(null);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setPoolingInProgress(true);
      console.info('[frontend][pooling] create pool start', { routeIds });
      const result = await frontendUseCases.createPool.execute(routeIds);
      setPoolResult(result);
      setSuccess(`Pool ${result.poolId} created successfully`);
      console.info('[frontend][pooling] create pool success', { poolId: result.poolId });
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][pooling] create pool failed', { message, requestError });
      setError(message);
    } finally {
      setPoolingInProgress(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Pooling</h2>
          <p className="text-sm text-slate-600 md:text-base">
            Build a compliance pool (Article 21) with greedy surplus allocation across selected routes.
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

      <div className="section-card flex flex-wrap items-center justify-between gap-3 bg-white/70">
        <p className="text-sm text-slate-600">
          Selected routes: <span className="font-semibold text-slate-900">{selectedCount}</span>
        </p>
        <p className="text-xs text-slate-500">Tip: include both surplus and deficit routes for useful pooling.</p>
      </div>

      {error ? <AlertBanner title="Pooling request failed" message={error} variant="error" onDismiss={() => setError(null)} /> : null}
      {success ? (
        <AlertBanner
          title="Pool created"
          message={success}
          variant="success"
          onDismiss={() => setSuccess(null)}
        />
      ) : null}
      {loading ? <LoadingBlock label="Loading compliance data..." /> : null}

      {!loading ? (
        <div className="section-card overflow-x-auto">
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
        className="button-primary"
        disabled={poolingInProgress}
      >
        {poolingInProgress ? 'Creating pool...' : 'Create Pool'}
      </button>

      {poolResult ? (
        <div className="section-card space-y-2 bg-cyan-50/60">
          <p className="text-sm font-semibold text-slate-900">
            Pool {poolResult.poolId} created at {new Date(poolResult.createdAt).toLocaleString()}
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
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
