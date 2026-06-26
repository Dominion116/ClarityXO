import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveAddressName, resolveAddressNames, clearBNSCache } from '../bns';

beforeEach(() => {
  clearBNSCache();
  vi.restoreAllMocks();
});

afterEach(() => {
  clearBNSCache();
});

describe('resolveAddressName', () => {
  it('returns null for null address', async () => {
    const result = await resolveAddressName(null);
    expect(result).toBeNull();
  });

  it('returns null for anonymous address', async () => {
    const result = await resolveAddressName('anonymous');
    expect(result).toBeNull();
  });

  it('returns null for empty string', async () => {
    const result = await resolveAddressName('');
    expect(result).toBeNull();
  });

  it('returns BNS name from API when available', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ names: ['alice.btc'] }),
    });
    const result = await resolveAddressName('SP123');
    expect(result).toBe('alice.btc');
  });

  it('returns null when address has no names', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ names: [] }),
    });
    const result = await resolveAddressName('SP456');
    expect(result).toBeNull();
  });

  it('returns null on API failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    const result = await resolveAddressName('SP789');
    expect(result).toBeNull();
  });

  it('returns null on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    const result = await resolveAddressName('SP999');
    expect(result).toBeNull();
  });

  it('caches result so API is only called once for same address', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ names: ['bob.btc'] }),
    });
    await resolveAddressName('SP111');
    await resolveAddressName('SP111');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('resolveAddressNames', () => {
  it('returns empty object for empty array', async () => {
    const result = await resolveAddressNames([]);
    expect(result).toEqual({});
  });

  it('resolves multiple addresses in parallel', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ names: ['alice.btc'] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ names: ['bob.btc'] }) });
    const result = await resolveAddressNames(['SP1', 'SP2']);
    expect(result['SP1']).toBe('alice.btc');
    expect(result['SP2']).toBe('bob.btc');
  });

  it('omits addresses with no BNS name from result', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ names: [] }) });
    const result = await resolveAddressNames(['SP1']);
    expect(Object.keys(result)).toHaveLength(0);
  });
});
