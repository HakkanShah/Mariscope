import { useEffect, useMemo, useState } from 'react';

import type { RouteModel } from '../../../core/domain';
import { frontendUseCases } from '../../infrastructure/api/use-cases';

const formatNumber = (value: number | null) => {
  if (value === null) {
    return 'Not set';
  }

  return value.toFixed(4);
};

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baselineDrafts, setBaselineDrafts] = useState<Record<string, string>>({});

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frontendUseCases.getRoutes.execute();
      setRoutes(data);
      setBaselineDrafts(
        data.reduce<Record<string, string>>((acc, route) => {
          acc[route.id] =
            route.baselineIntensityGco2ePerMj === null
              ? ''
              : route.baselineIntensityGco2ePerMj.toString();
          return acc;
        }, {}),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoutes();
  }, []);

  const totalFuelConsumption = useMemo(() => {
    return routes.reduce((sum, route) => sum + route.fuelConsumptionTonnes, 0);
  }, [routes]);

  const handleBaselineUpdate = async (routeId: string) => {
    const draft = baselineDrafts[routeId];
    const baselineValue = Number(draft);

    if (!Number.isFinite(baselineValue) || baselineValue < 0) {
      setError('Baseline intensity must be a non-negative number');
      return;
    }

    try {
      setError(null);
      const updated = await frontendUseCases.setBaseline.execute(routeId, baselineValue);
      setRoutes((current) => current.map((route) => (route.id === routeId ? updated : route)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to update baseline');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Routes</h2>
          <p className="text-sm text-slate-600">
            Manage route baseline values and inspect route-level fuel and intensity data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadRoutes();
          }}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading routes...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2">Fuel (t)</th>
                <th className="px-3 py-2">Actual Intensity</th>
                <th className="px-3 py-2">Baseline</th>
                <th className="px-3 py-2">Update Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{route.name}</p>
                    <p className="text-xs text-slate-500">{route.id}</p>
                  </td>
                  <td className="px-3 py-2">{route.fuelConsumptionTonnes.toFixed(2)}</td>
                  <td className="px-3 py-2">{route.actualIntensityGco2ePerMj.toFixed(4)}</td>
                  <td className="px-3 py-2">{formatNumber(route.baselineIntensityGco2ePerMj)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={baselineDrafts[route.id] ?? ''}
                        onChange={(event) => {
                          setBaselineDrafts((current) => ({
                            ...current,
                            [route.id]: event.target.value,
                          }));
                        }}
                        className="w-28 rounded-md border border-slate-300 px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void handleBaselineUpdate(route.id);
                        }}
                        className="rounded-md bg-cyan-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-600"
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <td className="px-3 py-2 font-medium">Total</td>
                <td className="px-3 py-2">{totalFuelConsumption.toFixed(2)}</td>
                <td className="px-3 py-2" colSpan={3}>
                  {routes.length} routes loaded
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
    </div>
  );
};
