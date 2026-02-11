import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App navigation', () => {
  it('renders all primary tabs', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Routes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Banking' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pooling' })).toBeInTheDocument();
  });
});

