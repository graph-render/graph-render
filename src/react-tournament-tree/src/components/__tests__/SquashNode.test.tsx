import { SquashNodeRenderMode } from '@graph-render/types';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SquashNode } from '../SquashNode/SquashNode';
import { MOCK_META, renderWithAppearance } from './testUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test fixture needs to accept arbitrary meta values including null and throwing getters
const makeNode = (meta: unknown = MOCK_META): any => ({
  id: 'node-1',
  position: { x: 0, y: 0 },
  size: { width: 280, height: 100 },
  meta,
});

describe('SquashNode', () => {
  it('renders in Export SVG mode (default)', () => {
    renderWithAppearance(
      <svg>
        <SquashNode node={makeNode()} renderMode={SquashNodeRenderMode.Export} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });

  it('renders in Html mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNode node={makeNode()} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-html')).toBeInTheDocument();
  });

  it('renders player names from meta', () => {
    renderWithAppearance(
      <svg>
        <SquashNode node={makeNode(MOCK_META)} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('renders TBD players when meta is null', () => {
    renderWithAppearance(
      <svg>
        <SquashNode node={makeNode(null)} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    const tbdElements = screen.getAllByText('TBD');
    expect(tbdElements.length).toBeGreaterThan(0);
  });

  it('renders error boundary fallback for invalid meta that throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    // Passing a getter that throws to trigger the error boundary
    const badNode = {
      id: 'bad-node',
      position: { x: 0, y: 0 },
      size: { width: 280, height: 100 },
      get meta(): never {
        throw new Error('meta access error');
      },
    };

    renderWithAppearance(
      <svg>
        <SquashNode node={badNode} renderMode={SquashNodeRenderMode.Svg} />
      </svg>
    );

    expect(screen.getByText('Invalid match data')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('uses fallback dimensions when node.size is undefined', () => {
    const nodeWithoutSize = { ...makeNode(), size: undefined };
    renderWithAppearance(
      <svg>
        <SquashNode node={nodeWithoutSize as never} renderMode={SquashNodeRenderMode.Svg} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });
});
