export function isValidStacksAddress(addr) {
  if (!addr || typeof addr !== 'string') return false;
  return /^S[PM][0-9A-Z]{33,41}$/.test(addr);
}

export function isValidMonth(str) {
  if (!str || typeof str !== 'string') return false;
  return /^\d{4}-\d{2}$/.test(str);
}

export function isValidGameId(id) {
  const n = Number(id);
  return Number.isFinite(n) && n >= 1 && Number.isInteger(n);
}

export function isValidOutcome(outcome) {
  return ['win', 'draw', 'loss'].includes(outcome);
}

export function isValidReferralCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z0-9]{10}$/.test(code);
}
