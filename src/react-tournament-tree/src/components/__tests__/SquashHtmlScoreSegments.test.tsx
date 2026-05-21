import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SquashHtmlScoreSegments } from '../SquashNode/SquashHtmlScoreSegments';
import { MOCK_COLORS } from './testUtils';

const defaultProps = {
  nodeId: 'n1',
  playerIndex: 0,
  scoreSegments: ['6', '4', '7'],
  textColor: '#333',
  colors: MOCK_COLORS,
  scoreFontSize: 12,
  scoreSegW: 22,
  scoreSegG: 4,
  scoreFontFamily: 'monospace',
};

describe('SquashHtmlScoreSegments', () => {
  it('renders the correct number of score segments', () => {
    render(<SquashHtmlScoreSegments {...defaultProps} />);
    // Check text content of rendered segments
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders N-1 dividers for N segments', () => {
    render(<SquashHtmlScoreSegments {...defaultProps} />);
    // Divider spans have width: 1px style and data-testid="score-divider"
    const dividers = screen.getAllByTestId('score-divider');
    expect(dividers).toHaveLength(2); // 3 segments → 2 dividers
  });

  it('renders no dividers for a single segment', () => {
    render(<SquashHtmlScoreSegments {...defaultProps} scoreSegments={['6']} />);
    expect(screen.queryAllByTestId('score-divider')).toHaveLength(0);
  });

  it('truncates segments longer than 4 characters', () => {
    render(<SquashHtmlScoreSegments {...defaultProps} scoreSegments={['12345']} />);
    // truncateText('12345', 4) → '123…' (Unicode ellipsis, slices to maxLength-1=3 chars)
    expect(screen.getByText('123\u2026')).toBeInTheDocument();
  });

  it('renders correctly for player index 1', () => {
    render(<SquashHtmlScoreSegments {...defaultProps} playerIndex={1} scoreSegments={['3']} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
