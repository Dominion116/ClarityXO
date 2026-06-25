import React from 'react';

const LABELS = {
  pending:   '⏳ Pending…',
  confirmed: '✓ Confirmed',
  dropped:   '⚠ Dropped — retry',
};

const COLORS = {
  pending:   'var(--gold)',
  confirmed: 'var(--green)',
  dropped:   'var(--red)',
};

export default function TxStatusBadge({ txStatus }) {
  if (!txStatus) return null;
  return (
    <span
      className="tx-status-badge"
      style={{ color: COLORS[txStatus] }}
      aria-live="polite"
    >
      {LABELS[txStatus]}
    </span>
  );
}
