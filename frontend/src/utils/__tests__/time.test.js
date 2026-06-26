import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { msToSeconds, secondsToMs, isExpired, timeAgo, formatDate } from '../time';

describe('msToSeconds', () => {
  it('converts 1000ms to 1s', () => expect(msToSeconds(1000)).toBe(1));
  it('converts 1500ms to 1s (floor)', () => expect(msToSeconds(1500)).toBe(1));
  it('converts 0ms to 0s', () => expect(msToSeconds(0)).toBe(0));
  it('converts 60000ms to 60s', () => expect(msToSeconds(60000)).toBe(60));
});

describe('secondsToMs', () => {
  it('converts 1s to 1000ms', () => expect(secondsToMs(1)).toBe(1000));
  it('converts 0s to 0ms', () => expect(secondsToMs(0)).toBe(0));
  it('converts 60s to 60000ms', () => expect(secondsToMs(60)).toBe(60000));
});

describe('isExpired', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns true when expiry is in the past', () => {
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    expect(isExpired(new Date('2026-06-01T11:00:00Z').getTime())).toBe(true);
  });

  it('returns false when expiry is in the future', () => {
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    expect(isExpired(new Date('2026-06-01T13:00:00Z').getTime())).toBe(false);
  });
});

describe('timeAgo', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns seconds ago for < 1 min', () => {
    const now = new Date('2026-06-01T12:00:30Z');
    vi.setSystemTime(now);
    expect(timeAgo(new Date('2026-06-01T12:00:00Z'))).toBe('30s ago');
  });

  it('returns minutes ago for < 1 hour', () => {
    const now = new Date('2026-06-01T12:05:00Z');
    vi.setSystemTime(now);
    expect(timeAgo(new Date('2026-06-01T12:00:00Z'))).toBe('5m ago');
  });

  it('returns hours ago for < 1 day', () => {
    const now = new Date('2026-06-01T15:00:00Z');
    vi.setSystemTime(now);
    expect(timeAgo(new Date('2026-06-01T12:00:00Z'))).toBe('3h ago');
  });

  it('returns days ago for >= 1 day', () => {
    const now = new Date('2026-06-03T12:00:00Z');
    vi.setSystemTime(now);
    expect(timeAgo(new Date('2026-06-01T12:00:00Z'))).toBe('2d ago');
  });
});
