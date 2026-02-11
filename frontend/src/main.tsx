import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './adapters/ui/App';
import './shared/styles/tailwind.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

