import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphErrorBoundary } from '../GraphErrorBoundary';

const ThrowingChild = ({ shouldThrow }: { readonly shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('boom');
  }

  return <div>Recovered graph</div>;
};

describe('GraphErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports render errors and shows the default fallback', () => {
    const onError = vi.fn();

    render(
      <GraphErrorBoundary onError={onError}>
        <ThrowingChild shouldThrow />
      </GraphErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Graph failed to render: boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('recovers when resetKeys change', () => {
    const { rerender } = render(
      <GraphErrorBoundary resetKeys={['bad']}>
        <ThrowingChild shouldThrow />
      </GraphErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <GraphErrorBoundary resetKeys={['good']}>
        <ThrowingChild shouldThrow={false} />
      </GraphErrorBoundary>
    );

    expect(screen.getByText('Recovered graph')).toBeInTheDocument();
  });
});
