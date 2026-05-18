import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SetWins } from '../../utils/squash';
import { SquashNodeHtml } from '../SquashNode/SquashNodeHtml';
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

describe('SquashNodeHtml', () => {
  it('renders as a foreignObject', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} />
      </svg>
    );
    expect(screen.getByTestId('squash-node-html')).toBeInTheDocument();
  });

  it('renders both player names', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} />
      </svg>
    );
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('does NOT show live indicator for completed matches', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} meta={MOCK_META} />
      </svg>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows live indicator for live matches', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} meta={MOCK_META_LIVE} winnerIndex={null} />
      </svg>
    );
    expect(screen.getByRole('status', { name: 'Live match' })).toBeInTheDocument();
  });

  it('renders score segments for completed matches', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} meta={MOCK_META} />
      </svg>
    );
    // MOCK_META has sets: [[6,4]] → player 0 shows '6', player 1 shows '4'
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders without crashing when meta status is Upcoming', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml
          {...baseVariantProps}
          meta={MOCK_META_UPCOMING}
          setWins={{ p1: 0, p2: 0 }}
          winnerIndex={null}
        />
      </svg>
    );
    expect(screen.getByText('Player One')).toBeInTheDocument();
  });

  it('renders in dark mode without crashing', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeHtml {...baseVariantProps} />
      </svg>,
      undefined,
      true
    );
    expect(screen.getByText('Player One')).toBeInTheDocument();
  });
});
