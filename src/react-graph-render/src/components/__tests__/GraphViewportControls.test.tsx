import { GraphControlsPosition } from '@graph-render/types/react';
import { fireEvent, render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { GraphViewportControls } from '../GraphViewportControls';

const makeProps = (overrides: Partial<ComponentProps<typeof GraphViewportControls>> = {}) => ({
  width: 800,
  height: 600,
  position: GraphControlsPosition.TopLeft,
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  fitView: vi.fn(),
  resetViewport: vi.fn(),
  ...overrides,
});

describe('GraphViewportControls', () => {
  it('renders a group with aria-label="viewport-controls"', () => {
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps()} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="viewport-controls"]')).not.toBeNull();
  });

  it('renders 4 control buttons', () => {
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps()} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    expect(buttons.length).toBe(4);
  });

  it('includes focus-visible styling for keyboard users', () => {
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps()} />
      </svg>
    );

    expect(container.querySelector('style')?.textContent).toContain(':focus-visible');
  });

  it('each button has an aria-label', () => {
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps()} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    for (const btn of buttons) {
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('calls zoomIn when zoom-in button is clicked', () => {
    const zoomIn = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ zoomIn })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.click(buttons[0]!);
    expect(zoomIn).toHaveBeenCalledTimes(1);
  });

  it('calls zoomOut when zoom-out button is clicked', () => {
    const zoomOut = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ zoomOut })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.click(buttons[1]!);
    expect(zoomOut).toHaveBeenCalledTimes(1);
  });

  it('calls fitView when fit button is clicked', () => {
    const fitView = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ fitView })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.click(buttons[2]!);
    expect(fitView).toHaveBeenCalledTimes(1);
  });

  it('calls resetViewport when reset button is clicked', () => {
    const resetViewport = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ resetViewport })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.click(buttons[3]!);
    expect(resetViewport).toHaveBeenCalledTimes(1);
  });

  it('applies TopLeft transform at inset 12', () => {
    const { container } = render(
      <svg>
        <GraphViewportControls
          {...makeProps({ position: GraphControlsPosition.TopLeft, width: 800, height: 600 })}
        />
      </svg>
    );
    const group = container.querySelector('g[aria-label="viewport-controls"]');
    const transform = group?.getAttribute('transform') ?? '';
    // TopLeft → x=12, y=12
    expect(transform).toContain('translate(12, 12)');
  });

  it('button responds to Enter key', () => {
    const zoomIn = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ zoomIn })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.keyDown(buttons[0]!, { key: 'Enter' });
    expect(zoomIn).toHaveBeenCalledTimes(1);
  });

  it('button responds to Space key', () => {
    const fitView = vi.fn();
    const { container } = render(
      <svg>
        <GraphViewportControls {...makeProps({ fitView })} />
      </svg>
    );
    const buttons = container.querySelectorAll('[role="button"]');
    fireEvent.keyDown(buttons[2]!, { key: ' ' });
    expect(fitView).toHaveBeenCalledTimes(1);
  });
});
