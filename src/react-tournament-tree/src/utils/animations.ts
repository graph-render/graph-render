export function ensureSquashNodeAnimations(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('style[data-squash-node-animations]')) {
    return;
  }

  const styleTag = document.createElement('style');
  styleTag.dataset['squashNodeAnimations'] = 'true';
  styleTag.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-squash-live-indicator] {
        animation: none !important;
      }
    }

    [data-match-card]:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }

    g[data-match-card]:focus-visible [data-match-card-rect] {
      stroke-width: 3px;
    }
  `;
  document.head.append(styleTag);
}
