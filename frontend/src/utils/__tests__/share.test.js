import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateShareText, generateTwitterUrl, generateWarpcastUrl, copyToClipboard } from '../share';

describe('generateShareText', () => {
  it('returns a win message containing the app URL', () => {
    const text = generateShareText({ outcome: 'win', rank: 1, pts: 30, bnsName: null });
    expect(text).toContain('clarityxo.xyz');
  });

  it('win message includes rank number when provided', () => {
    const text = generateShareText({ outcome: 'win', rank: 3, pts: 20 });
    expect(text).toContain('3');
  });

  it('win message includes pts when provided', () => {
    const text = generateShareText({ outcome: 'win', rank: null, pts: 27 });
    expect(text).toContain('27 pts');
  });

  it('win PvP message mentions pvp challenge', () => {
    const text = generateShareText({ outcome: 'win', gameMode: 'pvp', rank: null, pts: 5 });
    expect(text.toLowerCase()).toContain('pvp');
  });

  it('draw message mentions draw', () => {
    const text = generateShareText({ outcome: 'draw', rank: null, pts: 1 });
    expect(text.toLowerCase()).toContain('drew');
  });

  it('loss message mentions lost', () => {
    const text = generateShareText({ outcome: 'loss', rank: null, pts: 0 });
    expect(text.toLowerCase()).toContain('lost');
  });

  it('unknown outcome returns generic message with app URL', () => {
    const text = generateShareText({ outcome: 'unknown', rank: null, pts: 0 });
    expect(text).toContain('clarityxo.xyz');
  });

  it('uses bnsName in message when provided', () => {
    const text = generateShareText({ outcome: 'win', rank: 1, pts: 10, bnsName: 'alice.stx' });
    expect(text).toContain('alice.stx');
  });
});

describe('generateTwitterUrl', () => {
  it('returns a valid twitter intent URL', () => {
    const url = generateTwitterUrl('Hello world');
    expect(url).toContain('twitter.com/intent/tweet');
    expect(url).toContain(encodeURIComponent('Hello world'));
  });
});

describe('generateWarpcastUrl', () => {
  it('returns a warpcast compose URL', () => {
    const url = generateWarpcastUrl('Hello warp');
    expect(url).toContain('warpcast.com');
    expect(url).toContain(encodeURIComponent('Hello warp'));
  });
});

describe('copyToClipboard', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('calls navigator.clipboard.writeText with the text', async () => {
    const result = await copyToClipboard('test text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result).toBe(true);
  });
});
