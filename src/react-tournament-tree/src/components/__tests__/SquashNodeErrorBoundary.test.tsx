import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SquashNodeErrorBoundary } from '../SquashNode/SquashNodeErrorBoundary';

function ThrowingChild(): never {
  throw new Error('Render error');
}

describe('SquashNodeErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <svg>
        <SquashNodeErrorBoundary
          nodeId="n1"
          renderMode={SquashNodeRenderMode.Svg}
          width={280}
          height={100}
        >
          <text>OK</text>
        </SquashNodeErrorBoundary>
      </svg>
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders InvalidSquashNode fallback when child throws', () => {
    // Suppress error boundary console output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    render(
      <svg>
        <SquashNodeErrorBoundary
          nodeId="error-node"
          renderMode={SquashNodeRenderMode.Svg}
          width={280}
          height={100}
        >
          <ThrowingChild />
        </SquashNodeErrorBoundary>
      </svg>
    );

    expect(screen.getByText('Invalid match data')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('calls onRenderError with nodeId and error when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    const onRenderError = vi.fn();

    render(
      <svg>
        <SquashNodeErrorBoundary
          nodeId="err-node"
          renderMode={SquashNodeRenderMode.Svg}
          width={280}
          height={100}
          onRenderError={onRenderError}
        >
          <ThrowingChild />
        </SquashNodeErrorBoundary>
      </svg>
    );

    expect(onRenderError).toHaveBeenCalledWith('err-node', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('renders Html fallback when renderMode is Html', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    render(
      <svg>
        <SquashNodeErrorBoundary
          nodeId="html-err"
          renderMode={SquashNodeRenderMode.Html}
          width={280}
          height={100}
        >
          <ThrowingChild />
        </SquashNodeErrorBoundary>
      </svg>
    );

    expect(screen.getByTestId('invalid-node-html')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
