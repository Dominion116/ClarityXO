import { CONFIG } from '../config';

function apiUrl(path) {
  return `${CONFIG.leaderboardApiBaseUrl}${path}`;
}

export async function fetchPlayerStats(address) {
  if (!address) return null;
  try {
    const res = await fetch(apiUrl(`/api/player/${encodeURIComponent(address)}/stats`), {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Stats API error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching player stats:', e);
    return null;
  }
}
