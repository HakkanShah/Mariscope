import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AdjustedComplianceRecord, CreatePoolResponse } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const PoolingPage = () => {
  const [adjustedRows, setAdjustedRows] = useState<AdjustedComplianceRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [poolResult, setPoolResult] = useState<CreatePoolResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [poolingInProgress, setPoolingInProgress] = useState(false);
  const [year, setYear] = useState(2024);

  const loadAdjusted = useCallback(async (selectedYear: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const data = await frontendUseCases.getAdjustedCB.execute({ year: selectedYear });
      setAdjustedRows(data);
      setSelected(
        data.reduce<Record<string, boolean>>((acc, row) => {
          acc[row.shipId] = true;
          return acc;
        }, {}),
      );
    } catch (requestError) {
      setError(formatUserError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdjusted(year);
  }, [loadAdjusted, year]);

  const selectedShipIds = useMemo(() => {
    return Object.entries(selected)
      .filter(([, included]) => included)
      .map(([shipId]) => shipId);
  }, [selected]);

  const poolSum = useMemo(() => {
    const selectedIds = new Set(selectedShipIds);
    return adjustedRows
      .filter((row) => selectedIds.has(row.shipId))
      .reduce((sum, row) => sum + row.adjustedCb, 0);
  }, [adjustedRows, selectedShipIds]);

  const handleCreatePool = async () => {
    if (selectedShipIds.length === 0) {
      setError('Select at least one ship to create a pool.');
      setSuccess(null);
      return;
    }

    if (poolSum < 0) {
      setError('Pool sum is negative. Remove deficit-heavy ships until Pool Sum is non-negative.');
      setSuccess(null);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setPoolingInProgress(true);
      const result = await frontendUseCases.createPool.execute(year, selectedShipIds);
      setPoolResult(result);
      setSuccess(`Pool ${result.poolId} created successfully`);
    } catch (requestError) {
      setError(formatUserError(requestError));
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
            Create a valid Article 21 pool with adjusted CB members and greedy allocation.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm sm:w-auto"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void loadAdjusted(year);
            }}
            className="button-muted w-full sm:w-auto"
          >
            Reload
          </button>
        </div>
      </div>

      <div className="section-card flex flex-wrap items-center justify-between gap-3 bg-white/70">
        <p className="text-sm text-slate-600">
          Selected ships: <span className="font-semibold text-slate-900">{selectedShipIds.length}</span>
        </p>
        <p className={`text-sm font-semibold ${poolSum >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          Pool Sum: {poolSum.toFixed(2)}
        </p>
      </div>

      {error ? (
        <AlertBanner title="Pooling request failed" message={error} variant="error" onDismiss={() => setError(null)} />
      ) : null}
      {success ? (
        <AlertBanner
          title="Pool created"
          message={success}
          variant="success"
          onDismiss={() => setSuccess(null)}
        />
      ) : null}
      {loading ? <LoadingBlock label="Loading adjusted compliance data..." /> : null}

      {!loading ? (
        <>
          <div className="space-y-3 md:hidden">
            {adjustedRows.map((row) => (
              <article key={row.shipId} className="section-card space-y-2 p-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{row.shipId}</p>
                  <label className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-700">
                    <input
                      type="checkbox"
                      checked={selected[row.shipId] ?? false}
                      onChange={(event) => {
                        setSelected((current) => ({
                          ...current,
                          [row.shipId]: event.target.checked,
                        }));
                      }}
                    />
                    Include
                  </label>
                </div>
                <dl className="grid grid-cols-3 gap-2">
                  <div>
                    <dt className="text-slate-500">CB Before</dt>
                    <dd className={`font-semibold ${row.cbBefore >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {row.cbBefore.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Applied</dt>
                    <dd className="font-semibold text-cyan-800">{row.applied.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Adjusted</dt>
                    <dd className={`font-semibold ${row.adjustedCb >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {row.adjustedCb.toFixed(2)}
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
                <th className="px-3 py-2">Include</th>
                <th className="px-3 py-2">Ship</th>
                <th className="px-3 py-2">CB Before</th>
                <th className="px-3 py-2">Applied</th>
                <th className="px-3 py-2">Adjusted CB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {adjustedRows.map((row) => (
                <tr key={row.shipId}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected[row.shipId] ?? false}
                      onChange={(event) => {
                        setSelected((current) => ({
                          ...current,
                          [row.shipId]: event.target.checked,
                        }));
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">{row.shipId}</td>
                  <td className={`px-3 py-2 ${row.cbBefore >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {row.cbBefore.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-cyan-800">{row.applied.toFixed(2)}</td>
                  <td className={`px-3 py-2 ${row.adjustedCb >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {row.adjustedCb.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void handleCreatePool();
        }}
        className="button-primary w-full md:w-auto"
        disabled={poolingInProgress}
      >
        {poolingInProgress ? 'Creating pool...' : 'Create Pool'}
      </button>

      {poolResult ? (
        <div className="section-card space-y-2 bg-cyan-50/60">
          <p className="text-sm font-semibold text-slate-900">
            Pool {poolResult.poolId} created at {new Date(poolResult.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-slate-600">
            Sum Before: {poolResult.poolSumBefore.toFixed(2)} | Sum After: {poolResult.poolSumAfter.toFixed(2)}
          </p>
          <div className="space-y-2 md:hidden">
            {poolResult.entries.map((entry) => (
              <article key={entry.shipId} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <p className="font-semibold text-slate-900">{entry.shipId}</p>
                <p className="text-slate-600">CB Before: {entry.cbBefore.toFixed(2)}</p>
                <p className={`${entry.cbAfter >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  CB After: {entry.cbAfter.toFixed(2)}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
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
