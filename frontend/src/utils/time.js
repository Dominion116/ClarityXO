export function msToSeconds(ms) {
  return Math.floor(ms / 1000);
}

export function secondsToMs(s) {
  return s * 1000;
}

export function isExpired(expiresAt) {
  return Date.now() > expiresAt;
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
