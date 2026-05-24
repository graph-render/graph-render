export function ensureTournamentPrintStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('style[data-tournament-print-styles]')) {
    return;
  }

  const styleTag = document.createElement('style');
  styleTag.dataset['tournamentPrintStyles'] = 'true';
  styleTag.textContent = `
    @media print {
      [data-print-hidden] {
        display: none !important;
      }

      [data-tournament-bracket-frame] {
        max-width: none !important;
        width: max-content !important;
        overflow: visible !important;
        background: #ffffff !important;
        color: #111827 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }

      [data-tournament-bracket-content] {
        overflow: visible !important;
        background: #ffffff !important;
        padding: 0 !important;
      }

      [data-match-card] {
        break-inside: avoid;
        color: #111827 !important;
      }
    }
  `;
  document.head.append(styleTag);
}
