import { useCallback, useEffect, useState } from 'react';

import type { ApplyBankedResponse, BankSurplusResponse, RouteModel } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';

export const BankingPage = () => {
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');
  const [bankResult, setBankResult] = useState<BankSurplusResponse | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyBankedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frontendUseCases.getRoutes.execute();
      setRoutes(data);
      setSelectedRouteId((current) => current || data[0]?.id || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  const handleBank = async () => {
    if (selectedRouteId.length === 0) {
      return;
    }

    try {
      setError(null);
      const parsedAmount = bankAmount.trim().length > 0 ? Number(bankAmount) : undefined;
      const result = await frontendUseCases.bankSurplus.execute(selectedRouteId, parsedAmount);
      setBankResult(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to bank surplus');
    }
  };

  const handleApply = async () => {
    if (selectedRouteId.length === 0) {
      return;
    }

    const parsedAmount = Number(applyAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount to apply must be greater than zero');
      return;
    }

    try {
      setError(null);
      const result = await frontendUseCases.applyBanked.execute(selectedRouteId, parsedAmount);
      setApplyResult(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to apply banked amount');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Banking</h2>
        <p className="text-sm text-slate-600">
          Execute Article 20 flows by banking a route surplus and applying banked amounts to deficits.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading routes...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="space-y-3 rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Bank Surplus</h3>
            <label className="block text-sm text-slate-700">
              Route
              <select
                value={selectedRouteId}
                onChange={(event) => {
                  setSelectedRouteId(event.target.value);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Amount to bank (optional, defaults to full surplus)
              <input
                type="number"
                step="0.01"
                value={bankAmount}
                onChange={(event) => {
                  setBankAmount(event.target.value);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                void handleBank();
              }}
              className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600"
            >
              Bank
            </button>
          </section>

          <section className="space-y-3 rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Apply Banked Amount
            </h3>
            <label className="block text-sm text-slate-700">
              Amount to apply
              <input
                type="number"
                step="0.01"
                value={applyAmount}
                onChange={(event) => {
                  setApplyAmount(event.target.value);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                void handleApply();
              }}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Apply
            </button>
          </section>
        </div>
      ) : null}

      {bankResult ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Banking Result</p>
          <p>Route: {bankResult.routeId}</p>
          <p>Banked now: {bankResult.bankedAmount.toFixed(2)}</p>
          <p>Total banked: {bankResult.newBankedTotal.toFixed(2)}</p>
        </div>
      ) : null}

      {applyResult ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <p className="font-semibold">Apply Result</p>
          <p>Route: {applyResult.routeId}</p>
          <p>Applied: {applyResult.appliedAmount.toFixed(2)}</p>
          <p>Adjusted CB: {applyResult.adjustedComplianceBalance.toFixed(2)}</p>
          <p>Remaining banked: {applyResult.remainingBankedAmount.toFixed(2)}</p>
        </div>
      ) : null}
    </div>
  );
};
