import { useState, useCallback } from 'react';
import { copyToClipboard } from '../utils/share';

export function useClipboard(resetAfterMs = 2500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), resetAfterMs);
    }
    return ok;
  }, [resetAfterMs]);

  return { copied, copy };
}
