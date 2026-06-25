import { useState, useCallback } from 'react';
import { createRematch } from '../utils/pvp';

const REMATCH_TIMEOUT_MS = 30_000;

export function useRematch(walletAddr) {
  const [rematchState, setRematchState] = useState(null);
  // null | { status: 'sending' | 'waiting' | 'accepted' | 'declined' | 'expired', opponent }

  const sendRematch = useCallback(async (opponentAddr) => {
    if (!walletAddr || !opponentAddr) return;
    setRematchState({ status: 'sending', opponent: opponentAddr });
    try {
      await createRematch(opponentAddr);
      setRematchState({ status: 'waiting', opponent: opponentAddr });
      setTimeout(() => {
        setRematchState((prev) => {
          if (prev?.status === 'waiting') return { status: 'expired', opponent: opponentAddr };
          return prev;
        });
      }, REMATCH_TIMEOUT_MS);
    } catch {
      setRematchState(null);
    }
  }, [walletAddr]);

  const acceptRematch = useCallback((opponentAddr) => {
    setRematchState({ status: 'accepted', opponent: opponentAddr });
  }, []);

  const clearRematch = useCallback(() => {
    setRematchState(null);
  }, []);

  return { rematchState, sendRematch, acceptRematch, clearRematch };
}
