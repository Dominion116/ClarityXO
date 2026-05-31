import { resolveZoneFileToProfile, Person } from '@stacks/profile';

const cache = new Map(); // addr → { profile: {name,avatarUrl}|null, expiresAt }
const TTL = 10 * 60 * 1000; // 10 min

function cacheNull(addr) {
  cache.set(addr, { profile: null, expiresAt: Date.now() + TTL });
  return null;
}

async function fetchWithTimeout(url, ms = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches a player's Gaia-stored profile for a given Stacks address.
 * Returns { name, avatarUrl } or null if no profile exists.
 * Uses @stacks/profile's resolveZoneFileToProfile + Person class.
 */
export async function fetchPlayerProfile(addr) {
  if (!addr || addr === 'anonymous') return null;

  const hit = cache.get(addr);
  if (hit && Date.now() < hit.expiresAt) return hit.profile;

  try {
    // Step 1: get primary BNS name for this address
    const namesRes = await fetchWithTimeout(`https://api.hiro.so/v1/addresses/stacks/${addr}`);
    if (!namesRes.ok) return cacheNull(addr);
    const bnsName = (await namesRes.json()).names?.[0];
    if (!bnsName) return cacheNull(addr);

    // Step 2: get the zone file for that name
    const nameRes = await fetchWithTimeout(`https://api.hiro.so/v1/names/${bnsName}`);
    if (!nameRes.ok) return cacheNull(addr);
    const zonefile = (await nameRes.json()).zonefile;
    if (!zonefile) return cacheNull(addr);

    // Step 3: resolve zone file → profile JSON using @stacks/profile
    const profileData = await resolveZoneFileToProfile({
      zoneFile: zonefile,
      publicKeyOrAddress: addr,
      network: 'mainnet',
    });

    // Step 4: extract name + avatar via the Person class
    const person = new Person(profileData);
    const result = {
      name: person.name() ?? null,
      avatarUrl: person.avatarUrl() ?? null,
    };

    cache.set(addr, { profile: result, expiresAt: Date.now() + TTL });
    return result;
  } catch {
    return cacheNull(addr);
  }
}

/**
 * Batch-fetches profiles for an array of addresses.
 * Returns a plain object keyed by address; addresses with no profile are omitted.
 */
export async function fetchPlayerProfiles(addrs) {
  const settled = await Promise.allSettled(
    addrs.map(addr => fetchPlayerProfile(addr).then(profile => ({ addr, profile })))
  );
  const map = {};
  for (const r of settled) {
    if (r.status === 'fulfilled' && r.value.profile) {
      map[r.value.addr] = r.value.profile;
    }
  }
  return map;
}
