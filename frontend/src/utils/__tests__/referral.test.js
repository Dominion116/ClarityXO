import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildReferralLink, parseReferralCodeFromUrl } from '../referral';

describe('buildReferralLink', () => {
  it('returns a URL containing the code', () => {
    const link = buildReferralLink('ABC123');
    expect(link).toContain('ABC123');
    expect(link).toContain('?ref=');
  });

  it('includes the app domain', () => {
    const link = buildReferralLink('XYZ');
    expect(link).toContain('clarityxo.xyz');
  });
});

describe('parseReferralCodeFromUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('returns null when no ref param is present', () => {
    window.location = { search: '?month=2026-05' };
    expect(parseReferralCodeFromUrl()).toBeNull();
  });

  it('returns the ref code when ?ref= is in the URL', () => {
    window.location = { search: '?ref=ABC123' };
    expect(parseReferralCodeFromUrl()).toBe('ABC123');
  });

  it('returns null when search string is empty', () => {
    window.location = { search: '' };
    expect(parseReferralCodeFromUrl()).toBeNull();
  });
});
