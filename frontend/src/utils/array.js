export function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function unique(arr, key) {
  if (!key) return [...new Set(arr)];
  const seen = new Set();
  return arr.filter(item => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function sortBy(arr, key, dir = 'asc') {
  return [...arr].sort((a, b) => {
    const va = a[key], vb = b[key];
    return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
}

export function groupBy(arr, key) {
  const groups = {};
  for (const item of arr) {
    const k = item[key];
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}

export function sumBy(arr, key) {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}
