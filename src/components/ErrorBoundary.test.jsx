import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function Bomb() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  let spy;
  beforeEach(() => { spy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); });

  it('renders children when nothing throws', () => {
    render(<ErrorBoundary><p>All good</p></ErrorBoundary>);
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders a fallback instead of crashing when a child throws', () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
