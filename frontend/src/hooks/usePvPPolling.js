import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPendingChallenge } from '../utils/pvp';

const POLL_INTERVAL_MS = 5000;

export function usePvPPolling(walletAddr, enabled = true) {
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    if (!walletAddr) return;
    try {
      const result = await fetchPendingChallenge(walletAddr);
      setPendingChallenge(result || null);
    } catch {
      // ignore transient fetch errors
    }
  }, [walletAddr]);

  useEffect(() => {
    if (!enabled || !walletAddr) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPendingChallenge(null);
      return;
    }
    setPolling(true);
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
      setPolling(false);
    };
  }, [enabled, walletAddr, poll]);

  return { pendingChallenge, polling };
}
