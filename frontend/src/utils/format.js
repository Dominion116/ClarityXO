export function truncateAddr(addr, prefixLen = 8, suffixLen = 4) {
  if (!addr || addr.length <= prefixLen + suffixLen + 1) return addr || '';
  return `${addr.slice(0, prefixLen)}…${addr.slice(-suffixLen)}`;
}

export function displayName(addr, bnsName, profile) {
  if (!addr || addr === 'anonymous') return 'anonymous';
  if (profile?.name) return profile.name;
  if (bnsName) return bnsName;
  return truncateAddr(addr);
}

export function formatPoints(pts) {
  if (pts === null || pts === undefined) return '—';
  return pts.toLocaleString();
}

export function formatWinRate(wins, games) {
  if (!games) return '0.0%';
  return `${((wins / games) * 100).toFixed(1)}%`;
}

export function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
