import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TournamentBracket } from '../TournamentBracket';

// Mock the heavy canvas dependency so that the component tree renders in jsdom.
vi.mock('@graph-render/react', () => ({
  Graph: vi.fn(() => null),
  groupPositionedNodesByColumn: vi.fn(() => []),
}));

vi.mock('@graph-render/core', () => ({
  renderGraphToSvg: vi.fn(() => ({ svg: '<svg></svg>' })),
}));

const MINIMAL_GRAPH = { nodes: {}, adj: {}, edges: {} };
const SINGLE_MATCH_GRAPH = { nodes: { final: {} }, adj: { final: {} }, edges: {} };

describe('TournamentBracket', () => {
  it('renders without crashing with minimal props', () => {
    expect(() => render(<TournamentBracket graph={MINIMAL_GRAPH} />)).not.toThrow();
  });

  it('renders the title text', () => {
    render(<TournamentBracket graph={MINIMAL_GRAPH} title="Championship 2025" />);
    expect(screen.getByText('Championship 2025')).toBeInTheDocument();
  });

  it('uses default title when none is provided', () => {
    render(<TournamentBracket graph={MINIMAL_GRAPH} />);
    expect(screen.getByText('Tournament Bracket')).toBeInTheDocument();
  });

  it('renders toolbar by default (showToolbar defaults to true)', () => {
    render(<TournamentBracket graph={MINIMAL_GRAPH} />);
    // The toolbar button for navigation mode should be present
    const navButtons = screen.queryAllByRole('button', { name: /navigation mode/i });
    expect(navButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('hides toolbar when showToolbar=false', () => {
    render(<TournamentBracket graph={MINIMAL_GRAPH} showToolbar={false} />);
    expect(screen.queryByRole('button', { name: /navigation mode/i })).not.toBeInTheDocument();
  });

  it('renders in dark mode without crashing', () => {
    expect(() => render(<TournamentBracket graph={MINIMAL_GRAPH} isDarkMode />)).not.toThrow();
  });

  it('renders with compact=false without crashing', () => {
    expect(() => render(<TournamentBracket graph={MINIMAL_GRAPH} compact={false} />)).not.toThrow();
  });

  it('renders with all SquashNodeRenderMode values without crashing', () => {
    for (const mode of Object.values(SquashNodeRenderMode)) {
      expect(() =>
        render(<TournamentBracket graph={MINIMAL_GRAPH} nodeRenderMode={mode} />)
      ).not.toThrow();
    }
  });

  it('renders with grouped toolbar options without crashing', () => {
    expect(() =>
      render(
        <TournamentBracket
          graph={MINIMAL_GRAPH}
          toolbar={{ showToolbar: true, showViewportControls: false }}
          theme={{ isDarkMode: false, defaultDarkMode: false }}
          interaction={{ panEnabled: true, zoomEnabled: true, pinchZoomEnabled: false }}
        />
      )
    ).not.toThrow();
  });

  it('renders with a custom vertexComponent without crashing', () => {
    const CustomVertex = () => React.createElement('div', { 'data-testid': 'custom-vertex' });
    expect(() =>
      render(<TournamentBracket graph={MINIMAL_GRAPH} vertexComponent={CustomVertex} />)
    ).not.toThrow();
  });

  it('renders with defaultNavigationMode=false without crashing', () => {
    expect(() =>
      render(<TournamentBracket graph={MINIMAL_GRAPH} defaultNavigationMode={false} />)
    ).not.toThrow();
  });

  it('renders badge text when provided', () => {
    render(<TournamentBracket graph={MINIMAL_GRAPH} badgeText="PSA" />);
    expect(screen.getByText('PSA')).toBeInTheDocument();
  });

  it('invokes onMatchClick and onInvalidNode refs without throwing', () => {
    const onMatchClick = vi.fn();
    const onInvalidNode = vi.fn();
    expect(() =>
      render(
        <TournamentBracket
          graph={MINIMAL_GRAPH}
          onMatchClick={onMatchClick}
          onInvalidNode={onInvalidNode}
        />
      )
    ).not.toThrow();
  });

  it('accepts onMatchUpdate for controlled editable match cards', () => {
    const onMatchUpdate = vi.fn();
    expect(() =>
      render(
        <TournamentBracket
          graph={MINIMAL_GRAPH}
          onMatchUpdate={onMatchUpdate}
          vertexComponent={() => null}
        />
      )
    ).not.toThrow();
  });

  it('uses localized generated round labels while preserving config label overrides', () => {
    const { rerender } = render(
      <TournamentBracket
        graph={SINGLE_MATCH_GRAPH}
        localization={{ roundLabels: { final: 'FINALE' } }}
      />
    );

    expect(screen.getByText('FINALE')).toBeInTheDocument();

    rerender(
      <TournamentBracket
        config={{ labels: ['Custom final'] }}
        graph={SINGLE_MATCH_GRAPH}
        localization={{ roundLabels: { final: 'FINALE' } }}
      />
    );

    expect(screen.getByText('Custom final')).toBeInTheDocument();
    expect(screen.queryByText('FINALE')).not.toBeInTheDocument();
  });
});
