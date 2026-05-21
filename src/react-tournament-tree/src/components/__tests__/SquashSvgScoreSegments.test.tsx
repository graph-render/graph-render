import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SquashSvgScoreSegments } from '../SquashNode/SquashSvgScoreSegments';
import { MOCK_COLORS } from './testUtils';

const defaultProps = {
  nodeId: 'n1',
  playerIndex: 0,
  scoreSegments: ['6', '4', '7'],
  scoreGroupLeftX: 200,
  rowHeight: 50,
  scoreSegW: 22,
  scoreSegG: 4,
  textColor: '#333',
  colors: MOCK_COLORS,
  scoreFontSize: 12,
  scoreFontFamily: 'monospace',
};

describe('SquashSvgScoreSegments', () => {
  it('renders a text element per score segment', () => {
    render(
      <svg>
        <SquashSvgScoreSegments {...defaultProps} />
      </svg>
    );
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders N-1 divider lines for N segments', () => {
    render(
      <svg>
        <SquashSvgScoreSegments {...defaultProps} />
      </svg>
    );
    const lines = screen.getAllByTestId('score-divider');
    expect(lines.length).toBe(2); // 3 segments → 2 dividers
  });

  it('renders no divider for a single segment', () => {
    render(
      <svg>
        <SquashSvgScoreSegments {...defaultProps} scoreSegments={['6']} />
      </svg>
    );
    expect(screen.queryAllByTestId('score-divider')).toHaveLength(0);
  });

  it('truncates segments longer than 4 characters', () => {
    render(
      <svg>
        <SquashSvgScoreSegments {...defaultProps} scoreSegments={['12345']} />
      </svg>
    );
    expect(screen.getByText('123\u2026')).toBeInTheDocument();
  });

  it('renders for player index 1', () => {
    render(
      <svg>
        <SquashSvgScoreSegments {...defaultProps} playerIndex={1} scoreSegments={['3']} />
      </svg>
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
