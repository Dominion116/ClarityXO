import { CONFIG } from '../config';

const APP_URL = 'https://clarityxo.xyz';

function apiUrl(path) {
  return `${CONFIG.leaderboardApiBaseUrl}${path}`;
}

export async function generateReferralCode(address) {
  if (!address) return null;
  try {
    const res = await fetch(apiUrl('/api/referral/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    if (!res.ok) throw new Error(`Referral API error: ${res.status}`);
    const data = await res.json();
    return data.code || null;
  } catch (e) {
    console.error('Error generating referral code:', e);
    return null;
  }
}

export async function fetchReferralStats(address) {
  if (!address) return null;
  try {
    const res = await fetch(apiUrl(`/api/referral/stats/${encodeURIComponent(address)}`), {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Referral stats error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching referral stats:', e);
    return null;
  }
}

export function buildReferralLink(code) {
  return `${APP_URL}?ref=${code}`;
}

export function parseReferralCodeFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || null;
  } catch {
    return null;
  }
}

export async function claimReferral(referrerAddress, newPlayerAddress) {
  if (!referrerAddress || !newPlayerAddress) return null;
  try {
    const res = await fetch(apiUrl('/api/referral/claim'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerAddress, newPlayerAddress }),
    });
    if (!res.ok) throw new Error(`Referral claim error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Error claiming referral:', e);
    return null;
  }
}
