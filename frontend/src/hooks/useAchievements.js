import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

function apiUrl(path) {
  return `${CONFIG.leaderboardApiBaseUrl}${path}`;
}

async function fetchAchievements(address) {
  if (!address) return { unlocked: [], locked: [] };
  try {
    const res = await fetch(apiUrl(`/api/player/${encodeURIComponent(address)}/achievements`), {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Achievements API error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching achievements:', e);
    return { unlocked: [], locked: [] };
  }
}

export function useAchievements(address) {
  const [unlocked, setUnlocked] = useState([]);
  const [locked, setLocked] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setUnlocked([]);
      setLocked([]);
      return;
    }
    setLoading(true);
    fetchAchievements(address)
      .then(({ unlocked: u = [], locked: l = [] }) => {
        setUnlocked(u);
        setLocked(l);
      })
      .finally(() => setLoading(false));
  }, [address]);

  return { unlocked, locked, loading };
}
