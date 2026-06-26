import { describe, it, expect } from 'vitest';
import { isValidStacksAddress, isValidMonth, isValidGameId, isValidOutcome, isValidReferralCode } from '../validate';

describe('isValidStacksAddress', () => {
  it('returns true for mainnet SP address', () => {
    expect(isValidStacksAddress('SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y')).toBe(true);
  });

  it('returns true for SM address', () => {
    expect(isValidStacksAddress('SM2C2YFP12AJZB4MABJBAJ6SSTMRJGAVRQB73MQQS')).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidStacksAddress(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidStacksAddress('')).toBe(false);
  });

  it('returns false for too-short string', () => {
    expect(isValidStacksAddress('SP123')).toBe(false);
  });
});

describe('isValidMonth', () => {
  it('returns true for valid YYYY-MM format', () => {
    expect(isValidMonth('2026-06')).toBe(true);
  });

  it('returns true for January', () => {
    expect(isValidMonth('2025-01')).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidMonth(null)).toBe(false);
  });

  it('returns false for wrong format', () => {
    expect(isValidMonth('2026/06')).toBe(false);
  });

  it('returns false for missing leading zero', () => {
    expect(isValidMonth('2026-6')).toBe(false);
  });
});

describe('isValidGameId', () => {
  it('returns true for 1', () => {
    expect(isValidGameId(1)).toBe(true);
  });

  it('returns true for large integer', () => {
    expect(isValidGameId(99999)).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isValidGameId(0)).toBe(false);
  });

  it('returns false for negative number', () => {
    expect(isValidGameId(-1)).toBe(false);
  });

  it('returns false for float', () => {
    expect(isValidGameId(1.5)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidGameId(NaN)).toBe(false);
  });
});

describe('isValidOutcome', () => {
  it('accepts win', () => expect(isValidOutcome('win')).toBe(true));
  it('accepts draw', () => expect(isValidOutcome('draw')).toBe(true));
  it('accepts loss', () => expect(isValidOutcome('loss')).toBe(true));
  it('rejects null', () => expect(isValidOutcome(null)).toBe(false));
  it('rejects Win (uppercase)', () => expect(isValidOutcome('Win')).toBe(false));
  it('rejects draws (plural)', () => expect(isValidOutcome('draws')).toBe(false));
});

describe('isValidReferralCode', () => {
  it('accepts 10-char uppercase alphanumeric code', () => {
    expect(isValidReferralCode('ABC12345XY')).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(isValidReferralCode('abc12345xy')).toBe(false);
  });

  it('rejects 9-char code', () => {
    expect(isValidReferralCode('ABC12345X')).toBe(false);
  });

  it('rejects 11-char code', () => {
    expect(isValidReferralCode('ABC12345XYZ')).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidReferralCode(null)).toBe(false);
  });

  it('rejects code with special chars', () => {
    expect(isValidReferralCode('ABC-12345X')).toBe(false);
  });
});
