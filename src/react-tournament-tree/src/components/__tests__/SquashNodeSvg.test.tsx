import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SetWins } from '../../utils/squash';
import { SquashNodeSvg } from '../SquashNode/SquashNodeSvg';
import {
  MOCK_COLORS,
  MOCK_META,
  MOCK_META_LIVE,
  MOCK_META_UPCOMING,
  renderWithAppearance,
} from './testUtils';

const baseVariantProps = {
  nodeId: 'test-node',
  nodeWidth: 280,
  nodeHeight: 100,
  compact: false,
  isHovered: false,
  hoveredPlayerIndex: null as number | null,
  normalizedActivePathKey: null as string | null,
  isNodeInActivePath: false,
  isTBD: false,
  meta: MOCK_META,
  setWins: { p1: 2, p2: 1 } as SetWins,
  winnerIndex: 0 as number | null,
  colors: MOCK_COLORS,
  onPlayerEnter: vi.fn(),
  onPlayerLeave: vi.fn(),
};

describe('SquashNodeSvg', () => {
  it('renders a background rect', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-rect')).toBeInTheDocument();
  });

  it('renders both player badge initials', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} />
      </svg>
    );
    expect(screen.getByText('PO')).toBeInTheDocument();
    expect(screen.getByText('PT')).toBeInTheDocument();
  });

  it('renders score values from meta.sets', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} meta={MOCK_META} />
      </svg>
    );
    // MOCK_META has sets [[6,4]] → player 0 gets '6', player 1 gets '4'
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders a clipPath for masking', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-svg-clip')).toBeInTheDocument();
  });

  it('renders a live indicator circle for live matches', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} meta={MOCK_META_LIVE} winnerIndex={null} />
      </svg>
    );
    expect(screen.getByRole('img', { name: 'Live match', hidden: true })).toBeInTheDocument();
  });

  it('does NOT render a live indicator for completed matches', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} meta={MOCK_META} />
      </svg>
    );
    expect(screen.queryByRole('img', { name: 'Live match', hidden: true })).not.toBeInTheDocument();
  });

  it('renders without crashing for upcoming match', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg
          {...baseVariantProps}
          meta={MOCK_META_UPCOMING}
          setWins={{ p1: 0, p2: 0 }}
          winnerIndex={null}
        />
      </svg>
    );
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} meta={MOCK_META_UPCOMING} winnerIndex={null} />
      </svg>
    );
    expect(screen.getAllByTestId('squash-node-svg-rect').length).toBeGreaterThan(0);
  });

  it('renders in compact mode without crashing', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeSvg {...baseVariantProps} compact />
      </svg>,
      undefined,
      false,
      true
    );
    expect(screen.getByText('PO')).toBeInTheDocument();
  });
});
