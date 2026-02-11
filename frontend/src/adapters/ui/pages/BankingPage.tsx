import { useCallback, useEffect, useState } from 'react';

import type { ApplyBankedResponse, BankSurplusResponse, RouteModel } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

export const BankingPage = () => {
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');
  const [bankResult, setBankResult] = useState<BankSurplusResponse | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyBankedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankingInProgress, setBankingInProgress] = useState(false);
  const [applyInProgress, setApplyInProgress] = useState(false);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      console.info('[frontend][banking] loading routes');
      const data = await frontendUseCases.getRoutes.execute();
      setRoutes(data);
      setSelectedRouteId((current) => current || data[0]?.id || '');
      console.info('[frontend][banking] routes loaded', { count: data.length });
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][banking] route load failed', { message, requestError });
      setError(message);
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
      setSuccess(null);
      setBankingInProgress(true);
      const parsedAmount = bankAmount.trim().length > 0 ? Number(bankAmount) : undefined;
      console.info('[frontend][banking] bank action start', { selectedRouteId, parsedAmount });
      const result = await frontendUseCases.bankSurplus.execute(selectedRouteId, parsedAmount);
      setBankResult(result);
      setSuccess(`Banked ${result.bankedAmount.toFixed(2)} for ${result.routeId}`);
      console.info('[frontend][banking] bank action success', result);
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][banking] bank action failed', { message, requestError });
      setError(message);
    } finally {
      setBankingInProgress(false);
    }
  };

  const handleApply = async () => {
    if (selectedRouteId.length === 0) {
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
      console.info('[frontend][banking] apply action start', { selectedRouteId, parsedAmount });
      const result = await frontendUseCases.applyBanked.execute(selectedRouteId, parsedAmount);
      setApplyResult(result);
      setSuccess(`Applied ${result.appliedAmount.toFixed(2)} for ${result.routeId}`);
      console.info('[frontend][banking] apply action success', result);
    } catch (requestError) {
      const message = formatUserError(requestError);
      console.error('[frontend][banking] apply action failed', { message, requestError });
      setError(message);
    } finally {
      setApplyInProgress(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Banking</h2>
        <p className="text-sm text-slate-600 md:text-base">
          Execute Article 20 flows by banking a route surplus and applying banked amounts to deficits.
        </p>
      </div>

      {error ? <AlertBanner title="Banking request failed" message={error} variant="error" onDismiss={() => setError(null)} /> : null}
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
        <div className="grid gap-4 md:grid-cols-2">
          <section className="section-card space-y-3">
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
              className="button-primary"
              disabled={bankingInProgress}
            >
              {bankingInProgress ? 'Banking...' : 'Bank'}
            </button>
          </section>

          <section className="section-card space-y-3">
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
              className="button-primary"
              disabled={applyInProgress}
            >
              {applyInProgress ? 'Applying...' : 'Apply'}
            </button>
          </section>
        </div>
      ) : null}

      {bankResult ? (
        <div className="section-card border-emerald-200 bg-emerald-50/80 text-sm text-emerald-900">
          <p className="font-semibold">Banking Result</p>
          <p>Route: {bankResult.routeId}</p>
          <p>Banked now: {bankResult.bankedAmount.toFixed(2)}</p>
          <p>Total banked: {bankResult.newBankedTotal.toFixed(2)}</p>
        </div>
      ) : null}

      {applyResult ? (
        <div className="section-card border-cyan-200 bg-cyan-50/80 text-sm text-cyan-900">
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
