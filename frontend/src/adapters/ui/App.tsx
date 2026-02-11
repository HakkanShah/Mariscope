import { NavLink, Route, Routes, BrowserRouter } from 'react-router-dom';

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

export const App = () => {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Mariscope</h1>
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-4 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-cyan-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <Routes>
              <Route path="/" element={<RoutesPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/banking" element={<BankingPage />} />
              <Route path="/pooling" element={<PoolingPage />} />
            </Routes>
          </section>
        </div>
      </main>
    </BrowserRouter>
  );
};
