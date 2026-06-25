const APP_URL = 'https://clarityxo.xyz';

export function generateShareText({ outcome, rank, pts, bnsName, gameMode = 'ai' }) {
  const name = bnsName || 'on ClarityXO';
  const rankStr = rank ? `Rank #${rank} ` : '';
  const ptsStr = pts ? `with ${pts} pts ` : '';

  if (outcome === 'win' && gameMode === 'pvp') {
    return `Just won a PvP game on-chain ${rankStr}${ptsStr}— challenge me at ${APP_URL} 🎮`;
  }
  if (outcome === 'win') {
    return `Beat the on-chain AI ${rankStr}${ptsStr}playing as ${name} — ${APP_URL} 🎮`;
  }
  if (outcome === 'draw') {
    return `Drew with the on-chain AI ${rankStr}${ptsStr}at ${APP_URL} — can you do better? 🎮`;
  }
  if (outcome === 'loss') {
    return `Lost to the on-chain AI at ${APP_URL} — rematch coming 💪`;
  }
  return `Playing ClarityXO — on-chain tic-tac-toe on Stacks. Join me at ${APP_URL} 🎮`;
}

export function generateTwitterUrl(text) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function generateWarpcastUrl(text) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback for older browsers
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  return ok;
}
