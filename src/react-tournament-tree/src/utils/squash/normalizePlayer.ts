import type { MatchPlayer } from '@graph-render/types/tournament';

import { DEFAULT_PLAYERS } from '../../constants';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const normalizePlayerKey = (value: string): string => value.trim().toLowerCase();

const normalizeOptionalString = (
  value: unknown,
  label: string,
  { allowEmpty = false }: { readonly allowEmpty?: boolean } = {}
): string | undefined => {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid match payload: ${label} must be a string when provided.`);
  }

  const trimmed = value.trim();
  if (!allowEmpty && !trimmed) {
    throw new TypeError(
      `Invalid match payload: ${label} must be a non-empty string when provided.`
    );
  }

  return trimmed;
};

export const normalizePlayer = (value: unknown, label: string): MatchPlayer => {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`Invalid match payload: ${label} must be an object.`);
  }

  const player = value as Partial<MatchPlayer>;
  if (typeof player.name !== 'string' || !player.name.trim()) {
    throw new TypeError(`Invalid match payload: ${label}.name must be a non-empty string.`);
  }

  if (player.seed != null && !isFiniteNumber(player.seed)) {
    throw new TypeError(`Invalid match payload: ${label}.seed must be a finite number.`);
  }
  if (player.isBye != null && typeof player.isBye !== 'boolean') {
    throw new TypeError(`Invalid match payload: ${label}.isBye must be a boolean when provided.`);
  }

  const id = normalizeOptionalString(player.id, `${label}.id`);
  const country = normalizeOptionalString(player.country, `${label}.country`);
  const avatarUrl = normalizeOptionalString(player.avatarUrl, `${label}.avatarUrl`);
  const teamName = normalizeOptionalString(player.teamName, `${label}.teamName`);
  return {
    ...(id ? { id } : {}),
    name: player.name.trim(),
    ...(player.seed !== undefined ? { seed: player.seed } : {}),
    ...(country ? { country } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(teamName ? { teamName } : {}),
    ...(player.isBye !== undefined ? { isBye: player.isBye } : {}),
  };
};

export const normalizePlayers = (value: unknown): readonly [MatchPlayer, MatchPlayer] => {
  if (value == null) {
    return [
      DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 },
      DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 },
    ];
  }

  if (!Array.isArray(value) || value.length < 1 || value.length > 2) {
    throw new TypeError('Invalid match payload: players must contain one or two entries.');
  }

  return [
    normalizePlayer(value[0], 'players[0]'),
    value[1] == null
      ? (DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 })
      : normalizePlayer(value[1], 'players[1]'),
  ];
};
