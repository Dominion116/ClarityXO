import { describe, it, expect } from 'vitest';
import { encodeCVArg, parseUintResult, parseGameStateFromClarityValue } from '../stacks';
import { uintCV, cvToHex } from '@stacks/transactions';

describe('encodeCVArg', () => {
  it('returns a hex string starting with 0x', () => {
    const result = encodeCVArg(uintCV(1));
    expect(typeof result).toBe('string');
    expect(result.startsWith('0x')).toBe(true);
  });

  it('encodes uint(0) differently from uint(1)', () => {
    const a = encodeCVArg(uintCV(0));
    const b = encodeCVArg(uintCV(1));
    expect(a).not.toBe(b);
  });

  it('encodes large uint values', () => {
    const result = encodeCVArg(uintCV(999999));
    expect(result.length).toBeGreaterThan(2);
  });
});

describe('parseUintResult', () => {
  it('returns 0 for null input', () => {
    expect(parseUintResult(null)).toBe(0);
  });

  it('returns 0 for empty object', () => {
    expect(parseUintResult({})).toBe(0);
  });

  it('returns 0 when result field is missing', () => {
    expect(parseUintResult({ ok: true })).toBe(0);
  });
});

describe('parseGameStateFromClarityValue', () => {
  it('returns default board of 9 zeros for null input', () => {
    const state = parseGameStateFromClarityValue(null);
    expect(state.board).toHaveLength(9);
    expect(state.board.every(c => c === 0)).toBe(true);
  });

  it('returns STATUS_ACTIVE (0) as default status', () => {
    const state = parseGameStateFromClarityValue({});
    expect(state.status).toBe(0);
  });

  it('returns 0 moves as default', () => {
    const state = parseGameStateFromClarityValue({});
    expect(state.moves).toBe(0);
  });

  it('returns null player as default', () => {
    const state = parseGameStateFromClarityValue({});
    expect(state.player).toBeNull();
  });
});
