import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BracketLocalizationProvider } from '../../contexts/BracketLocalizationContext';
import { SquashNodeContent } from '../SquashNode/SquashNodeContent';
import { MOCK_META, MOCK_META_LIVE, renderWithAppearance, withAppearance } from './testUtils';

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

  it('uses game results for best-of-N score and winner summaries', () => {
    renderWithAppearance(
      <svg>
        <SquashNodeContent
          node={makeNode({
            ...MOCK_META,
            games: [
              { label: 'M1', scores: [13, 11] },
              { label: 'M2', scores: [8, 13], winner: 1 },
              { label: 'M3', scores: [16, 14] },
            ],
            seriesFormat: { bestOf: 3, label: 'BO3' },
            sets: [],
          })}
          renderMode={SquashNodeRenderMode.Html}
        />
      </svg>
    );

    expect(screen.getByText('M1:13')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Score Player One 2 games/i })).toBeInTheDocument();
  });

  it('updates live scores from controlled graph data without remounting the card', () => {
    const { rerender } = renderWithAppearance(
      <svg>
        <SquashNodeContent
          node={makeNode({ ...MOCK_META_LIVE, sets: [[3, 2]] })}
          renderMode={SquashNodeRenderMode.Html}
        />
      </svg>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Live match' })).toBeInTheDocument();

    rerender(
      withAppearance(
        <svg>
          <SquashNodeContent
            node={makeNode({
              ...MOCK_META_LIVE,
              sets: [[11, 8]],
              status: 'completed',
            })}
            renderMode={SquashNodeRenderMode.Html}
          />
        </svg>
      )
    );

    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Live match' })).not.toBeInTheDocument();
  });

  it('renders localized schedule metadata for upcoming Html cards', () => {
    const scheduledAt = '2026-06-01T10:00:00Z';
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(scheduledAt));

    renderWithAppearance(
      <BracketLocalizationProvider
        localization={{
          locale: 'en-US',
          timeZone: 'UTC',
          statusLabels: { upcoming: 'scheduled' },
          uiLabels: { scheduled: 'Scheduled for' },
        }}
      >
        <svg>
          <SquashNodeContent
            node={makeNode({
              ...MOCK_META,
              scheduledAt,
              status: 'upcoming',
              venue: 'Court 1',
            })}
            renderMode={SquashNodeRenderMode.Html}
          />
        </svg>
      </BracketLocalizationProvider>
    );

    expect(screen.getByTestId('match-schedule-metadata')).toHaveTextContent(
      `${expectedDate} · Court 1`
    );
    expect(screen.getByRole('button', { name: /Status scheduled/i })).toHaveAccessibleName(
      /Scheduled for/
    );
  });

  it('renders schedule metadata in SVG/export mode', () => {
    const scheduledAt = '2026-06-01T10:00:00Z';
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(scheduledAt));

    renderWithAppearance(
      <BracketLocalizationProvider localization={{ locale: 'en-US', timeZone: 'UTC' }}>
        <svg>
          <SquashNodeContent
            node={makeNode({
              ...MOCK_META,
              scheduledAt,
              status: 'upcoming',
              venue: 'Court 2',
            })}
            renderMode={SquashNodeRenderMode.Export}
          />
        </svg>
      </BracketLocalizationProvider>
    );

    expect(screen.getByTestId('match-schedule-svg-metadata')).toHaveTextContent(
      `${expectedDate} · Court 2`
    );
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
