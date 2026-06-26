const PREFIX = 'clarityxo.';

export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    return true;
  } catch {
    return false;
  }
}

export function storageHas(key) {
  try {
    return localStorage.getItem(PREFIX + key) !== null;
  } catch {
    return false;
  }
}
