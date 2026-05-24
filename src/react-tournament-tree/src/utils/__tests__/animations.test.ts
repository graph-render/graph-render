import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ensureSquashNodeAnimations } from '../animations';

describe('ensureSquashNodeAnimations', () => {
  const STYLE_SELECTOR = 'style[data-squash-node-animations]';

  beforeEach(() => {
    // Remove any style tags injected by previous tests
    for (const el of document.head.querySelectorAll(STYLE_SELECTOR)) {
      el.remove();
    }
  });

  afterEach(() => {
    for (const el of document.head.querySelectorAll(STYLE_SELECTOR)) {
      el.remove();
    }
  });

  it('injects a style tag into document.head', () => {
    ensureSquashNodeAnimations();
    const styleTag = document.head.querySelector(STYLE_SELECTOR);
    expect(styleTag).not.toBeNull();
  });

  it('injected style tag contains the pulse keyframe', () => {
    ensureSquashNodeAnimations();
    const styleTag = document.head.querySelector(STYLE_SELECTOR);
    expect(styleTag?.textContent).toContain('@keyframes pulse');
  });

  it('injected style tag contains the reduced-motion media query', () => {
    ensureSquashNodeAnimations();
    const styleTag = document.head.querySelector(STYLE_SELECTOR);
    expect(styleTag?.textContent).toContain('prefers-reduced-motion');
    expect(styleTag?.textContent).toContain('[data-score-segment]');
    expect(styleTag?.textContent).toContain('[data-match-status-indicator]');
  });

  it('is idempotent — calling twice inserts only one style tag', () => {
    ensureSquashNodeAnimations();
    ensureSquashNodeAnimations();
    const tags = document.head.querySelectorAll(STYLE_SELECTOR);
    expect(tags).toHaveLength(1);
  });

  it('sets the data-squash-node-animations dataset attribute', () => {
    ensureSquashNodeAnimations();
    const styleTag = document.head.querySelector<HTMLStyleElement>(STYLE_SELECTOR);
    expect(styleTag?.dataset['squashNodeAnimations']).toBe('true');
  });
});
