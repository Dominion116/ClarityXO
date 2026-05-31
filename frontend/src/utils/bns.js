import { BNS_CONTRACT_NAME } from '@stacks/bns';

// BNS_CONTRACT_NAME = 'bns' — the on-chain contract powering name lookups below
const _BNS_CONTRACT = BNS_CONTRACT_NAME;

const cache = new Map(); // addr → { name: string|null, expiresAt: number }
const TTL = 5 * 60 * 1000; // 5 min

/**
 * Resolves a Stacks address to its primary BNS name (e.g. "alice.btc").
 * Returns null if the address has no registered name or the lookup fails.
 * Results are cached for 5 minutes.
 */
export async function resolveAddressName(addr) {
  if (!addr || addr === 'anonymous') return null;

  const hit = cache.get(addr);
  if (hit && Date.now() < hit.expiresAt) return hit.name;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://api.hiro.so/v1/addresses/stacks/${addr}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    const name = res.ok ? ((await res.json()).names?.[0] ?? null) : null;
    cache.set(addr, { name, expiresAt: Date.now() + TTL });
    return name;
  } catch {
    cache.set(addr, { name: null, expiresAt: Date.now() + TTL });
    return null;
  }
}

/**
 * Batch-resolves an array of addresses.
 * Returns a plain object keyed by address: { "SP1...": "alice.btc", ... }
 * Addresses with no name are omitted.
 */
export async function resolveAddressNames(addrs) {
  const results = await Promise.allSettled(
    addrs.map(addr => resolveAddressName(addr).then(name => ({ addr, name })))
  );
  const map = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.name) {
      map[r.value.addr] = r.value.name;
    }
  }
  return map;
}
