# Feature 01: Generic Tournament Model

## Description

Replace squash-first public vocabulary with generic tournament vocabulary. Current names like `SquashPlayer` and `SquashMatchMeta` make the package feel unsuitable for tennis, padel, esports, chess, badminton, and general tournament use.

## Requirements

- Introduce `MatchPlayer`, `MatchMeta`, `MatchNodeData`, `TournamentMatch`, and `TournamentStage` as primary public types.
- Keep `SquashPlayer` and `SquashMatchMeta` as deprecated aliases for backward compatibility.
- Support two-player matches, one-player bye/walkover cases, and future multi-competitor/group structures.
- Add generic fields for seed, country, avatar, team, scheduled time, venue, match type, bracket section, and series format.
- Update docs and examples to use generic names first.

## Suggested API

```ts
export interface MatchPlayer {
  readonly id?: string;
  readonly name: string;
  readonly seed?: number;
  readonly country?: string;
  readonly avatarUrl?: string;
  readonly teamName?: string;
}

export interface MatchMeta {
  readonly stage?: string;
  readonly players?: readonly MatchPlayer[];
  readonly status?: MatchStatus;
  readonly matchType?: MatchType;
  readonly bracketSection?: BracketSection;
  readonly scheduledAt?: string;
  readonly timezone?: string;
  readonly venue?: string;
}

/** @deprecated Use MatchPlayer. */
export type SquashPlayer = MatchPlayer;

/** @deprecated Use MatchMeta. */
export type SquashMatchMeta = MatchMeta;
```

## Acceptance Criteria

- Public docs no longer start with squash-specific types.
- Existing squash examples still compile through deprecated aliases.
- `onMatchClick` exposes generic match-node types.
- No breaking runtime behavior for current users.
