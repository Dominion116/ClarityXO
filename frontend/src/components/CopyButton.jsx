import React from 'react';
import { useClipboard } from '../hooks/useClipboard';

export default function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied ✓', className = 'ghost-btn' }) {
  const { copied, copy } = useClipboard();
  return (
    <button className={className} onClick={() => copy(text)} aria-label={copied ? copiedLabel : label}>
      {copied ? copiedLabel : label}
    </button>
  );
}
