import { useCallback, useEffect, useMemo, useState } from 'react';

import type { RouteModel } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';
import { formatUserError } from '../../../shared/errors/format-user-error';
import { AlertBanner } from '../../../shared/ui/AlertBanner';
import { LoadingBlock } from '../../../shared/ui/LoadingBlock';

const formatNumber = (value: number, digits = 2) => value.toFixed(digits);

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingRouteId, setSavingRouteId] = useState<string | null>(null);

  const [vesselFilter, setVesselFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const data = await frontendUseCases.getRoutes.execute();
      setRoutes(data);
    } catch (requestError) {
      setError(formatUserError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  const vesselOptions = useMemo(
    () => Array.from(new Set(routes.map((route) => route.vesselType))),
    [routes],
  );
  const fuelOptions = useMemo(
    () => Array.from(new Set(routes.map((route) => route.fuelType))),
    [routes],
  );
  const yearOptions = useMemo(
    () => Array.from(new Set(routes.map((route) => route.year))).sort((a, b) => a - b),
    [routes],
  );

  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) => {
        if (vesselFilter !== 'all' && route.vesselType !== vesselFilter) {
          return false;
        }

        if (fuelFilter !== 'all' && route.fuelType !== fuelFilter) {
          return false;
        }

        if (yearFilter !== 'all' && route.year !== Number(yearFilter)) {
          return false;
        }

        return true;
      }),
    [routes, vesselFilter, fuelFilter, yearFilter],
  );

  const handleSetBaseline = async (routeId: string) => {
    try {
      setError(null);
      setSuccess(null);
      setSavingRouteId(routeId);
      const updated = await frontendUseCases.setBaseline.execute(routeId);
      setSuccess(`Baseline updated to ${updated.id} (${updated.year})`);
      await loadRoutes();
    } catch (requestError) {
      setError(formatUserError(requestError));
    } finally {
      setSavingRouteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Routes</h2>
        <p className="text-sm text-slate-600 md:text-base">
          View seeded route data, apply filters, and set the baseline route.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm text-slate-700">
          Vessel Type
          <select
            value={vesselFilter}
            onChange={(event) => setVesselFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
          >
            <option value="all">All</option>
            {vesselOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Fuel Type
          <select
            value={fuelFilter}
            onChange={(event) => setFuelFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
          >
            <option value="all">All</option>
            {fuelOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Year
          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
          >
            <option value="all">All</option>
            {yearOptions.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button type="button" onClick={() => void loadRoutes()} className="button-muted w-full">
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <AlertBanner title="Request failed" message={error} variant="error" onDismiss={() => setError(null)} />
      ) : null}
      {success ? (
        <AlertBanner
          title="Update complete"
          message={success}
          variant="success"
          onDismiss={() => setSuccess(null)}
        />
      ) : null}

      {loading ? <LoadingBlock label="Loading routes..." /> : null}

      {!loading && filteredRoutes.length > 0 ? (
        <div className="section-card overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Route ID</th>
                <th className="px-3 py-2">Vessel Type</th>
                <th className="px-3 py-2">Fuel Type</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">GHG Intensity</th>
                <th className="px-3 py-2">Fuel (t)</th>
                <th className="px-3 py-2">Distance (km)</th>
                <th className="px-3 py-2">Total Emissions (t)</th>
                <th className="px-3 py-2">Baseline</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRoutes.map((route) => (
                <tr key={route.id}>
                  <td className="px-3 py-2 font-medium">{route.id}</td>
                  <td className="px-3 py-2">{route.vesselType}</td>
                  <td className="px-3 py-2">{route.fuelType}</td>
                  <td className="px-3 py-2">{route.year}</td>
                  <td className="px-3 py-2">{formatNumber(route.ghgIntensityGco2ePerMj, 3)}</td>
                  <td className="px-3 py-2">{formatNumber(route.fuelConsumptionTonnes)}</td>
                  <td className="px-3 py-2">{formatNumber(route.distanceKm)}</td>
                  <td className="px-3 py-2">{formatNumber(route.totalEmissionsTonnes)}</td>
                  <td className="px-3 py-2">
                    {route.isBaseline ? (
                      <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleSetBaseline(route.id);
                      }}
                      className="button-primary px-3 py-1.5 text-xs"
                      disabled={savingRouteId === route.id || route.isBaseline}
                    >
                      {savingRouteId === route.id ? 'Saving...' : 'Set Baseline'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && filteredRoutes.length === 0 ? (
        <div className="section-card text-sm text-slate-600">No routes match the selected filters.</div>
      ) : null}
    </div>
  );
};
