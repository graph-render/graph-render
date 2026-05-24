import { describe, expect, it } from 'vitest';

import { ensureTournamentPrintStyles } from '../printStyles';

describe('ensureTournamentPrintStyles', () => {
  it('injects print styles once', () => {
    document.querySelector('style[data-tournament-print-styles]')?.remove();

    ensureTournamentPrintStyles();
    ensureTournamentPrintStyles();

    const styles = document.querySelectorAll('style[data-tournament-print-styles]');
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain('@media print');
    expect(styles[0]?.textContent).toContain('[data-print-hidden]');
    expect(styles[0]?.textContent).toContain('[data-tournament-bracket-frame]');
  });
});
