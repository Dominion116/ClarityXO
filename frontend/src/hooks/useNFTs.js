import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

function apiUrl(path) {
  return `${CONFIG.leaderboardApiBaseUrl}${path}`;
}

async function fetchNFTs(address) {
  if (!address) return [];
  try {
    const res = await fetch(apiUrl(`/api/nfts/${encodeURIComponent(address)}`), { cache: 'no-store' });
    if (!res.ok) throw new Error(`NFTs API error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.trophies) ? data.trophies : [];
  } catch (e) {
    console.error('Error fetching NFTs:', e);
    return [];
  }
}

export function useNFTs(address) {
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) { setTrophies([]); return; }
    setLoading(true);
    fetchNFTs(address).then(setTrophies).finally(() => setLoading(false));
  }, [address]);

  return { trophies, loading };
}
