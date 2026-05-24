import type {
  MultiStageTournamentConfig,
  TournamentBracketAppearance,
  TournamentStage,
} from '@graph-render/types/tournament';
import React, { useState } from 'react';

import {
  calculateGroupAdvancers,
  generateDoubleEliminationBracket,
  generateSingleEliminationBracket,
} from '../utils/tournament';
import { RoundRobinBracket } from './RoundRobinBracket';
import { TournamentBracket } from './TournamentBracket';

export interface MultiStageTournamentProps {
  readonly stages: MultiStageTournamentConfig['stages'];
  readonly title?: string | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly isDarkMode?: boolean | undefined;
  readonly compact?: boolean | undefined;
}

export const MultiStageTournament = React.memo<MultiStageTournamentProps>(
  function MultiStageTournament({
    appearance,
    compact = true,
    isDarkMode = false,
    stages,
    title = 'Tournament',
  }) {
    const [activeStageIndex, setActiveStageIndex] = useState(0);
    const activeStage = stages[activeStageIndex];

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (stages.length === 0) return;

      const lastIndex = stages.length - 1;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveStageIndex((index) => (index >= lastIndex ? 0 : index + 1));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveStageIndex((index) => (index <= 0 ? lastIndex : index - 1));
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveStageIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveStageIndex(lastIndex);
      }
    };

    return (
      <section aria-label={title} data-multi-stage-tournament>
        <div
          role="tablist"
          aria-label={`${title} stages`}
          tabIndex={0}
          onKeyDown={handleTabKeyDown}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          {stages.map((stage, index) => {
            const isActive = index === activeStageIndex;
            return (
              <button
                key={stage.id ?? `${stage.type}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`multi-stage-panel-${index}`}
                id={`multi-stage-tab-${index}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveStageIndex(index)}
                style={{
                  border: '1px solid currentColor',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontWeight: 800,
                  opacity: isActive ? 1 : 0.62,
                  padding: '8px 12px',
                }}
              >
                {stage.name ?? defaultStageName(stage, index)}
              </button>
            );
          })}
        </div>

        {activeStage ? (
          <div
            role="tabpanel"
            id={`multi-stage-panel-${activeStageIndex}`}
            aria-labelledby={`multi-stage-tab-${activeStageIndex}`}
          >
            <MultiStagePanel
              appearance={appearance}
              compact={compact}
              isDarkMode={isDarkMode}
              stage={activeStage}
              title={activeStage.name ?? defaultStageName(activeStage, activeStageIndex)}
            />
          </div>
        ) : null}
      </section>
    );
  }
);

MultiStageTournament.displayName = 'MultiStageTournament';

function MultiStagePanel({
  appearance,
  compact,
  isDarkMode,
  stage,
  title,
}: {
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly compact: boolean;
  readonly isDarkMode: boolean;
  readonly stage: TournamentStage;
  readonly title: string;
}) {
  if (stage.type === 'groups') {
    const groups = stage.groups ?? [];
    const advancers = groups.length > 0 ? calculateGroupAdvancers(groups, stage.advancement) : [];

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {advancers.length > 0 ? <AdvancersList players={advancers} /> : null}
        <div style={{ display: 'grid', gap: 16 }}>
          {groups.map((group) => (
            <RoundRobinBracket
              key={group.id}
              appearance={appearance}
              compact={compact}
              groupName={group.name ?? group.id}
              isDarkMode={isDarkMode}
              matches={group.matches}
              participants={group.participants}
              points={group.points}
              title={title}
            />
          ))}
        </div>
      </div>
    );
  }

  const graph = resolveEliminationGraph(stage);

  return (
    <TournamentBracket
      appearance={appearance}
      compact={compact}
      graph={graph}
      isDarkMode={isDarkMode}
      title={title}
    />
  );
}

function AdvancersList({
  players,
}: {
  readonly players: ReadonlyArray<{ readonly name: string }>;
}) {
  return (
    <aside
      aria-label="Advanced participants"
      style={{
        border: '1px solid currentColor',
        borderRadius: 12,
        padding: '10px 12px',
      }}
    >
      <strong>Advancing:</strong> {players.map((player) => player.name).join(', ')}
    </aside>
  );
}

function resolveEliminationGraph(
  stage: Extract<TournamentStage, { readonly type: 'elimination' }>
) {
  if (stage.bracket) {
    return stage.bracket;
  }

  if (!stage.participants || stage.participants.length < 2) {
    throw new Error('Elimination stages require a provided bracket or at least two participants.');
  }

  if (stage.format === 'double') {
    return generateDoubleEliminationBracket(stage.participants);
  }

  return generateSingleEliminationBracket(stage.participants);
}

function defaultStageName(stage: TournamentStage, index: number): string {
  if (stage.type === 'groups') return stage.name ?? `Group stage ${index + 1}`;
  if (stage.format === 'double') return stage.name ?? 'Double elimination';
  return stage.name ?? 'Knockout';
}
