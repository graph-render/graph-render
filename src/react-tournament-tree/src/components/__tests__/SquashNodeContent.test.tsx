import { SquashNodeRenderMode } from '@graph-render/types';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SquashNodeContent } from '../SquashNode/SquashNodeContent';
import { MOCK_META, MOCK_META_LIVE, renderWithAppearance } from './testUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test fixture needs to accept arbitrary meta values including null
const makeNode = (meta: unknown = MOCK_META): any => ({
  id: 'node-1',
  position: { x: 0, y: 0 },
  size: { width: 280, height: 100 },
  meta,
});

describe('SquashNodeContent', () => {
  it('renders foreignObject in Html mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode()} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-html')).toBeInTheDocument();
  });

  it('renders SVG <rect> in Export mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode()} renderMode={SquashNodeRenderMode.Export} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
    expect(screen.queryByTestId('squash-node-html')).not.toBeInTheDocument();
  });

  it('renders SVG <rect> in Svg mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode()} renderMode={SquashNodeRenderMode.Svg} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });

  it('renders SVG <rect> in Server mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode()} renderMode={SquashNodeRenderMode.Server} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });

  it('renders player names from meta', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode(MOCK_META)} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('renders TBD players when meta is null', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode(null)} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    // normalizeMatchMeta(null) → players are TBD
    const tbdElements = screen.getAllByText('TBD');
    expect(tbdElements.length).toBeGreaterThan(0);
  });

  it('shows live indicator for live match in Html mode', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode(MOCK_META_LIVE)} renderMode={SquashNodeRenderMode.Html} />
      </svg>
    );
    expect(screen.getByRole('status', { name: 'Live match' })).toBeInTheDocument();
  });

  it('uses default Export renderMode when not specified', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent node={makeNode()} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });
});
