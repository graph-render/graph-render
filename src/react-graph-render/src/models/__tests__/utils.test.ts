import { describe, expect, it } from 'vitest';

import { KeyboardDirection } from '../utils';

describe('KeyboardDirection enum', () => {
  it('has a Left value', () => {
    expect(KeyboardDirection.Left).toBe('left');
  });

  it('has a Right value', () => {
    expect(KeyboardDirection.Right).toBe('right');
  });

  it('has an Up value', () => {
    expect(KeyboardDirection.Up).toBe('up');
  });

  it('has a Down value', () => {
    expect(KeyboardDirection.Down).toBe('down');
  });

  it('has exactly 4 values', () => {
    const values = Object.values(KeyboardDirection);
    expect(values).toHaveLength(4);
  });

  it('all values are unique', () => {
    const values = Object.values(KeyboardDirection);
    expect(new Set(values).size).toBe(values.length);
  });
});
