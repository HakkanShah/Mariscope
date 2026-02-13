import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  ApplyBankedResponse,
  BankSurplusResponse,
  BankingRecordsResponse,
  ComplianceCBRecord,
  RouteModel,
} from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const BankingPage = () => {
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [complianceRows, setComplianceRows] = useState<ComplianceCBRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedShipId, setSelectedShipId] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');
  const [recordsResult, setRecordsResult] = useState<BankingRecordsResponse | null>(null);
  const [bankResult, setBankResult] = useState<BankSurplusResponse | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyBankedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankingInProgress, setBankingInProgress] = useState(false);
  const [applyInProgress, setApplyInProgress] = useState(false);

  const loadRoutes = useCallback(async () => {
    const data = await frontendUseCases.getRoutes.execute();
    setRoutes(data);

    const years = Array.from(new Set(data.map((route) => route.year))).sort((a, b) => a - b);
    const nextYear = years[0] ?? 2024;
    setSelectedYear(nextYear);
  }, []);

  const loadCompliance = useCallback(async (year: number) => {
    const data = await frontendUseCases.computeCB.execute({ year });
    setComplianceRows(data);
    setSelectedShipId((current) => current || data[0]?.shipId || '');
  }, []);

  const loadRecords = useCallback(async (year: number) => {
    const data = await frontendUseCases.getBankingRecords.execute({ year });
    setRecordsResult(data);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await loadRoutes();
      } catch (requestError) {
        setError(formatUserError(requestError));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [loadRoutes]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const run = async () => {
      try {
        setError(null);
        await loadCompliance(selectedYear);
      } catch (requestError) {
        setError(formatUserError(requestError));
      }
    };

    void run();
  }, [loadCompliance, loading, selectedYear]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const run = async () => {
      try {
        setError(null);
        await loadRecords(selectedYear);
      } catch (requestError) {
        setError(formatUserError(requestError));
      }
    };

    void run();
  }, [loadRecords, loading, selectedYear]);

  const selectedCompliance = useMemo(
    () => complianceRows.find((row) => row.shipId === selectedShipId) ?? null,
    [complianceRows, selectedShipId],
  );

  const canBank = (selectedCompliance?.cb ?? 0) > 0;
  const canApply = (selectedCompliance?.cb ?? 0) < 0 && (recordsResult?.currentBankedAmount ?? 0) > 0;

  const handleBank = async () => {
    if (selectedShipId.length === 0) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setBankingInProgress(true);
      const parsedAmount = bankAmount.trim().length > 0 ? Number(bankAmount) : undefined;
      const result = await frontendUseCases.bankSurplus.execute(selectedShipId, parsedAmount);
      setBankResult(result);
      setSuccess(`Banked ${result.bankedAmount.toFixed(2)} for ${result.shipId}`);
      await loadRecords(selectedYear);
    } catch (requestError) {
      setError(formatUserError(requestError));
    } finally {
      setBankingInProgress(false);
    }
  };

  const handleApply = async () => {
    if (selectedShipId.length === 0) {
      return;
    }

    const parsedAmount = Number(applyAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount to apply must be greater than zero');
      setSuccess(null);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setApplyInProgress(true);
      const result = await frontendUseCases.applyBanked.execute(selectedShipId, parsedAmount);
      setApplyResult(result);
      setSuccess(`Applied ${result.applied.toFixed(2)} to ${result.shipId}`);
      await loadRecords(selectedYear);
    } catch (requestError) {
      setError(formatUserError(requestError));
    } finally {
      setApplyInProgress(false);
    }
  };

  const yearOptions = Array.from(new Set(routes.map((route) => route.year))).sort((a, b) => a - b);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Banking</h2>
        <p className="text-sm text-slate-600 md:text-base">
          Run Article 20 actions with current CB, banked amount records, and apply KPIs.
        </p>
      </div>

      {error ? (
        <AlertBanner title="Banking request failed" message={error} variant="error" onDismiss={() => setError(null)} />
      ) : null}
      {success ? (
        <AlertBanner
          title="Action successful"
          message={success}
          variant="success"
          onDismiss={() => setSuccess(null)}
        />
      ) : null}

      {loading ? <LoadingBlock label="Loading route options..." /> : null}

      {!loading ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-slate-700">
              Year
              <select
                value={selectedYear}
                onChange={(event) => {
                  setSelectedYear(Number(event.target.value));
                  setBankResult(null);
                  setApplyResult(null);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700 md:col-span-2">
              Ship
              <select
                value={selectedShipId}
                onChange={(event) => {
                  setSelectedShipId(event.target.value);
                  setBankResult(null);
                  setApplyResult(null);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {complianceRows.map((row) => (
                  <option key={row.shipId} value={row.shipId}>
                    {row.shipId}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="section-card text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">CB Before</p>
              <p className={`mt-1 text-xl font-semibold ${(selectedCompliance?.cb ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {(selectedCompliance?.cb ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="section-card text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Applied</p>
              <p className="mt-1 text-xl font-semibold text-cyan-800">{(applyResult?.applied ?? 0).toFixed(2)}</p>
            </div>
            <div className="section-card text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">CB After</p>
              <p className={`mt-1 text-xl font-semibold ${(applyResult?.cbAfter ?? selectedCompliance?.cb ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {(applyResult?.cbAfter ?? selectedCompliance?.cb ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="section-card space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Bank Surplus</h3>
              <label className="block text-sm text-slate-700">
                Amount to bank (optional, defaults to full surplus)
                <input
                  type="number"
                  step="0.01"
                  value={bankAmount}
                  onChange={(event) => setBankAmount(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleBank()}
                className="button-primary"
                disabled={bankingInProgress || !canBank}
              >
                {bankingInProgress ? 'Banking...' : 'Bank'}
              </button>
              {!canBank ? <p className="text-xs text-slate-500">Banking is disabled because CB is not positive.</p> : null}
            </section>

            <section className="section-card space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Apply Banked Amount</h3>
              <label className="block text-sm text-slate-700">
                Amount to apply
                <input
                  type="number"
                  step="0.01"
                  value={applyAmount}
                  onChange={(event) => setApplyAmount(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleApply()}
                className="button-primary"
                disabled={applyInProgress || !canApply}
              >
                {applyInProgress ? 'Applying...' : 'Apply'}
              </button>
              {!canApply ? (
                <p className="text-xs text-slate-500">
                  Apply is disabled unless CB is negative and banked balance is available.
                </p>
              ) : null}
            </section>
          </div>

          {bankResult ? (
            <div className="section-card border-emerald-200 bg-emerald-50/80 text-sm text-emerald-900">
              <p className="font-semibold">Bank Result</p>
              <p>Ship: {bankResult.shipId}</p>
              <p>Banked now: {bankResult.bankedAmount.toFixed(2)}</p>
              <p>Total banked: {bankResult.newBankedTotal.toFixed(2)}</p>
            </div>
          ) : null}

          <div className="section-card overflow-x-auto">
            <p className="mb-3 text-sm font-semibold text-slate-800">Year Ledger Records</p>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(recordsResult?.records ?? []).map((record) => (
                  <tr key={record.id}>
                    <td className="px-3 py-2">{record.entryType}</td>
                    <td className="px-3 py-2">{record.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{new Date(record.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};
