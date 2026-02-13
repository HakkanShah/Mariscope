import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import { BankingPage } from './pages/BankingPage';
import { ComparePage } from './pages/ComparePage';
import { PoolingPage } from './pages/PoolingPage';
import { RoutesPage } from './pages/RoutesPage';

const tabs = [
  { to: '/', label: 'Routes' },
  { to: '/compare', label: 'Compare' },
  { to: '/banking', label: 'Banking' },
  { to: '/pooling', label: 'Pooling' },
] as const;

const RoutedWorkspace = () => {
  const location = useLocation();

  return (
    <section className="glass-panel p-3 sm:p-4 md:p-6">
      <div key={location.pathname} className="route-transition">
        <Routes location={location}>
          <Route path="/" element={<RoutesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/pooling" element={<PoolingPage />} />
        </Routes>
      </div>
    </section>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <main className="min-h-screen px-3 py-4 text-slate-900 sm:px-4 sm:py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="glass-panel overflow-hidden">
            <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[2fr_1fr] md:p-8">
              <div className="space-y-3">
                <p className="inline-flex rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-900">
                  FuelEU Compliance Console
                </p>
                <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Mariscope
                </h1>
                <p className="max-w-2xl text-xs text-slate-600 sm:text-sm md:text-base">
                  Operational workspace for route intensity, compliance balance, Article 20 banking, and
                  Article 21 pooling decisions.
                </p>
                <nav className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:flex-wrap sm:gap-2">
                  {tabs.map((tab) => (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      end={tab.to === '/'}
                      className={({ isActive }) =>
                        `w-full rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:w-auto sm:px-4 sm:text-sm ${
                          isActive
                            ? 'button-primary shadow-sm'
                            : 'button-muted hover:border-cyan-300 hover:text-cyan-900'
                        }`
                      }
                    >
                      {tab.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <aside className="grid grid-cols-2 gap-3 text-xs sm:text-sm md:grid-cols-1">
                <div className="section-card p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Target Intensity (2025)</p>
                  <p className="mt-1 text-xl font-bold text-cyan-900 sm:text-2xl">89.3368</p>
                  <p className="text-xs text-slate-500">gCO2e/MJ</p>
                </div>
                <div className="section-card p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Energy Factor</p>
                  <p className="mt-1 text-xl font-bold text-teal-800 sm:text-2xl">41,000</p>
                  <p className="text-xs text-slate-500">MJ per tonne</p>
                </div>
              </aside>
            </div>
          </header>

          <RoutedWorkspace />
        </div>
      </main>
    </BrowserRouter>
  );
};
