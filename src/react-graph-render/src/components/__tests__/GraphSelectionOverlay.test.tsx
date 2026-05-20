import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_MARQUEE_FILL } from '../../constants/graph';
import { GraphSelectionOverlay } from '../GraphSelectionOverlay';

describe('GraphSelectionOverlay', () => {
  it('renders nothing when rect is null', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={null} />
      </svg>
    );
    expect(container.querySelector('rect')).toBeNull();
  });

  it('renders a rect when rect is provided', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={{ x: 10, y: 20, width: 100, height: 80 }} />
      </svg>
    );
    expect(container.querySelector('rect')).not.toBeNull();
  });

  it('sets correct x, y, width, height attributes', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={{ x: 10, y: 20, width: 100, height: 80 }} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('x')).toBe('10');
    expect(rect?.getAttribute('y')).toBe('20');
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('80');
  });

  it('has a dashed stroke-dasharray', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={{ x: 0, y: 0, width: 50, height: 50 }} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('uses default marquee fill from theme constants', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={{ x: 0, y: 0, width: 50, height: 50 }} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('fill')).toBe(DEFAULT_MARQUEE_FILL);
  });

  it('has pointer-events none', () => {
    const { container } = render(
      <svg>
        <GraphSelectionOverlay rect={{ x: 0, y: 0, width: 50, height: 50 }} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('pointer-events')).toBe('none');
  });
});
