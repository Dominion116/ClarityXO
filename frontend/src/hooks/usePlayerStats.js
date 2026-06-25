import { useState, useEffect } from 'react';
import { fetchPlayerStats } from '../utils/playerStats';

export function usePlayerStats(address) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setStats(null);
      return;
    }
    setLoading(true);
    fetchPlayerStats(address)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [address]);

  return { stats, loading };
}
