import { useState } from 'react';

/**
 * Returns the player's avatar URL until it fails to load, then `undefined` so the
 * row falls back to the initials badge. A new URL gets a fresh attempt.
 */
export function usePlayerAvatar(avatarUrl: string | undefined): {
  readonly url: string | undefined;
  readonly onError: () => void;
} {
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined);
  const url = avatarUrl?.trim() || undefined;

  return {
    url: url && url !== failedUrl ? url : undefined,
    onError: () => setFailedUrl(url),
  };
}
