export function rankColor(rank) {
  if (rank === 1) return 'var(--gold)';
  if (rank === 2) return 'var(--silver)';
  if (rank === 3) return 'var(--bronze)';
  return 'var(--muted)';
}

export function outcomeColor(outcome) {
  if (outcome === 'win') return 'var(--green)';
  if (outcome === 'loss') return 'var(--red)';
  return 'var(--text)';
}

export function streakColor(streak) {
  if (streak >= 10) return 'var(--gold)';
  if (streak >= 5) return 'var(--green)';
  if (streak >= 3) return 'var(--red)';
  return 'var(--text)';
}
