/**
 * Unit tests for pure helper functions extracted from server.js.
 * These functions have no MongoDB or Stacks dependencies.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── getMonthKey (inline re-implementation matching server.js) ─────────────────

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

describe('getMonthKey', () => {
  it('returns YYYY-MM format for January', () => {
    const d = new Date('2026-01-15T00:00:00Z');
    assert.equal(getMonthKey(d), '2026-01');
  });

  it('returns YYYY-MM format for December', () => {
    const d = new Date('2025-12-31T23:59:59Z');
    assert.equal(getMonthKey(d), '2025-12');
  });

  it('pads single-digit months with a leading zero', () => {
    const d = new Date('2026-03-05T00:00:00Z');
    assert.equal(getMonthKey(d), '2026-03');
  });

  it('handles month rollover correctly', () => {
    const d = new Date('2025-09-01T00:00:00Z');
    assert.equal(getMonthKey(d), '2025-09');
  });
});

// ── generateReferralCode (inline re-implementation matching server.js) ────────

function generateReferralCode(address) {
  return `${address.slice(2, 8)}${address.slice(-4)}`.toUpperCase();
}

describe('generateReferralCode', () => {
  it('returns an 10-character code', () => {
    const code = generateReferralCode('SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y');
    assert.equal(code.length, 10);
  });

  it('returns uppercase string', () => {
    const code = generateReferralCode('SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y');
    assert.equal(code, code.toUpperCase());
  });

  it('is deterministic for the same address', () => {
    const addr = 'SP2C2YB2M7WZ8Q4P8A9VQYQMW9C03R9X62H2W8A1K';
    assert.equal(generateReferralCode(addr), generateReferralCode(addr));
  });

  it('differs for different addresses', () => {
    const a = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
    const b = 'SP2C2YB2M7WZ8Q4P8A9VQYQMW9C03R9X62H2W8A1K';
    assert.notEqual(generateReferralCode(a), generateReferralCode(b));
  });
});

// ── parseClarityUintValue (inline re-implementation) ──────────────────────────

function parseClarityUintValue(text) {
  const decoded = text;
  if (!decoded || typeof decoded !== 'object') {
    const match = String(text || '').match(/u(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  if (decoded.type === 'uint' && decoded.value != null) {
    return Number(decoded.value);
  }
  if (decoded.success && decoded.value) {
    return parseClarityUintValue(decoded.value);
  }
  return 0;
}

describe('parseClarityUintValue', () => {
  it('parses a u-prefixed string', () => {
    assert.equal(parseClarityUintValue('u42'), 42);
  });

  it('parses a uint CV object', () => {
    assert.equal(parseClarityUintValue({ type: 'uint', value: '100' }), 100);
  });

  it('parses a success wrapper', () => {
    assert.equal(parseClarityUintValue({ success: true, value: { type: 'uint', value: '7' } }), 7);
  });

  it('returns 0 for null input', () => {
    assert.equal(parseClarityUintValue(null), 0);
  });

  it('returns 0 for empty string', () => {
    assert.equal(parseClarityUintValue(''), 0);
  });

  it('returns 0 for unrecognised object shape', () => {
    assert.equal(parseClarityUintValue({ foo: 'bar' }), 0);
  });
});

// ── normalizePrincipalValue (inline re-implementation) ───────────────────────

function normalizePrincipalValue(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.value === 'string') return value.value;
    if (value.value && typeof value.value === 'object') return normalizePrincipalValue(value.value);
    if (typeof value.address === 'string') return value.address;
  }
  return null;
}

describe('normalizePrincipalValue', () => {
  it('returns string directly', () => {
    assert.equal(normalizePrincipalValue('SP123'), 'SP123');
  });

  it('returns null for null input', () => {
    assert.equal(normalizePrincipalValue(null), null);
  });

  it('extracts .value string from object', () => {
    assert.equal(normalizePrincipalValue({ value: 'SP456' }), 'SP456');
  });

  it('extracts .address string from object', () => {
    assert.equal(normalizePrincipalValue({ address: 'SP789' }), 'SP789');
  });

  it('handles nested value object', () => {
    assert.equal(normalizePrincipalValue({ value: { value: 'SPNESTED' } }), 'SPNESTED');
  });

  it('returns null for empty object', () => {
    assert.equal(normalizePrincipalValue({}), null);
  });
});
