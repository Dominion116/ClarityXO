import { describe, it, expect } from 'vitest';
import { truncateAddr, displayName, formatPoints, formatWinRate, ordinalSuffix } from '../format';

describe('truncateAddr', () => {
  it('truncates long address with ellipsis', () => {
    const addr = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
    const result = truncateAddr(addr);
    expect(result).toContain('…');
    expect(result.startsWith('SP30VGN6')).toBe(true);
  });

  it('returns the address unchanged when short enough', () => {
    expect(truncateAddr('SP1234', 8, 4)).toBe('SP1234');
  });

  it('returns empty string for null', () => {
    expect(truncateAddr(null)).toBe('');
  });

  it('respects custom prefix and suffix lengths', () => {
    const addr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = truncateAddr(addr, 3, 3);
    expect(result).toBe('ABC…XYZ');
  });
});

describe('displayName', () => {
  it('returns anonymous for anonymous address', () => {
    expect(displayName('anonymous', null, null)).toBe('anonymous');
  });

  it('returns anonymous for null address', () => {
    expect(displayName(null, null, null)).toBe('anonymous');
  });

  it('prefers profile name over BNS name', () => {
    expect(displayName('SP1', 'bns.btc', { name: 'Profile Name' })).toBe('Profile Name');
  });

  it('uses BNS name when no profile name', () => {
    expect(displayName('SP1', 'bns.btc', null)).toBe('bns.btc');
  });

  it('falls back to truncated address', () => {
    const addr = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
    const result = displayName(addr, null, null);
    expect(result).toContain('…');
  });
});

describe('formatPoints', () => {
  it('returns — for null', () => {
    expect(formatPoints(null)).toBe('—');
  });

  it('returns — for undefined', () => {
    expect(formatPoints(undefined)).toBe('—');
  });

  it('formats zero as 0', () => {
    expect(formatPoints(0)).toBe('0');
  });

  it('formats positive integer', () => {
    expect(formatPoints(42)).toBe('42');
  });
});

describe('formatWinRate', () => {
  it('returns 0.0% when games is 0', () => {
    expect(formatWinRate(0, 0)).toBe('0.0%');
  });

  it('returns 100.0% for all wins', () => {
    expect(formatWinRate(5, 5)).toBe('100.0%');
  });

  it('returns 50.0% for half wins', () => {
    expect(formatWinRate(3, 6)).toBe('50.0%');
  });

  it('rounds to one decimal place', () => {
    expect(formatWinRate(1, 3)).toBe('33.3%');
  });
});

describe('ordinalSuffix', () => {
  it('1 → 1st', () => {
    expect(ordinalSuffix(1)).toBe('1st');
  });

  it('2 → 2nd', () => {
    expect(ordinalSuffix(2)).toBe('2nd');
  });

  it('3 → 3rd', () => {
    expect(ordinalSuffix(3)).toBe('3rd');
  });

  it('4 → 4th', () => {
    expect(ordinalSuffix(4)).toBe('4th');
  });

  it('11 → 11th', () => {
    expect(ordinalSuffix(11)).toBe('11th');
  });

  it('21 → 21st', () => {
    expect(ordinalSuffix(21)).toBe('21st');
  });
});
