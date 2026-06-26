import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storageGet, storageSet, storageRemove, storageHas } from '../storage';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('storageSet + storageGet', () => {
  it('stores and retrieves a string value', () => {
    storageSet('mykey', 'hello');
    expect(storageGet('mykey')).toBe('hello');
  });

  it('stores and retrieves a number', () => {
    storageSet('num', 42);
    expect(storageGet('num')).toBe(42);
  });

  it('stores and retrieves an object', () => {
    storageSet('obj', { a: 1 });
    expect(storageGet('obj')).toEqual({ a: 1 });
  });

  it('stores and retrieves a boolean', () => {
    storageSet('flag', true);
    expect(storageGet('flag')).toBe(true);
  });

  it('returns fallback for missing key', () => {
    expect(storageGet('missing', 99)).toBe(99);
  });

  it('returns null fallback by default for missing key', () => {
    expect(storageGet('missing')).toBeNull();
  });

  it('prefixes key with clarityxo.', () => {
    storageSet('check', 1);
    expect(localStorage.getItem('clarityxo.check')).toBe('1');
  });
});

describe('storageRemove', () => {
  it('removes a key so storageGet returns fallback', () => {
    storageSet('rem', 5);
    storageRemove('rem');
    expect(storageGet('rem')).toBeNull();
  });

  it('returns true on success', () => {
    expect(storageRemove('anything')).toBe(true);
  });
});

describe('storageHas', () => {
  it('returns false for missing key', () => {
    expect(storageHas('nope')).toBe(false);
  });

  it('returns true after set', () => {
    storageSet('exists', 1);
    expect(storageHas('exists')).toBe(true);
  });

  it('returns false after remove', () => {
    storageSet('gone', 1);
    storageRemove('gone');
    expect(storageHas('gone')).toBe(false);
  });
});
