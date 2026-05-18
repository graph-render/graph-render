import { describe, expect, it } from 'vitest';

import { isFinitePoint, toError } from '../model/guards';

describe('isFinitePoint', () => {
  it('returns true for valid finite point', () => {
    expect(isFinitePoint({ x: 0, y: 0 })).toBe(true);
    expect(isFinitePoint({ x: -100, y: 50.5 })).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(isFinitePoint(undefined)).toBe(false);
  });

  it('returns false when x is NaN', () => {
    expect(isFinitePoint({ x: NaN, y: 0 })).toBe(false);
  });

  it('returns false when y is Infinity', () => {
    expect(isFinitePoint({ x: 0, y: Infinity })).toBe(false);
  });

  it('returns false when y is -Infinity', () => {
    expect(isFinitePoint({ x: 0, y: -Infinity })).toBe(false);
  });
});

describe('toError', () => {
  it('returns the same Error instance when given an Error', () => {
    const err = new Error('original');
    expect(toError(err)).toBe(err);
  });

  it('wraps a string in an Error', () => {
    const result = toError('oops');
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('oops');
  });

  it('wraps a number in an Error', () => {
    const result = toError(42);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('42');
  });

  it('wraps null in an Error', () => {
    const result = toError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('null');
  });

  it('wraps an object in an Error using String()', () => {
    const obj = { toString: () => 'custom' };
    const result = toError(obj);
    expect(result.message).toBe('custom');
  });
});
