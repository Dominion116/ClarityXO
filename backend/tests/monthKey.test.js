import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

function monthKeyToLabel(key) {
  const { year, month } = parseMonthKey(key);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isCurrentMonth(key) {
  return key === getMonthKey();
}

describe('getMonthKey output format', () => {
  it('matches YYYY-MM pattern', () => {
    const key = getMonthKey(new Date('2026-06-15T00:00:00Z'));
    assert.match(key, /^\d{4}-\d{2}$/);
  });

  it('is 7 characters long', () => {
    assert.equal(getMonthKey(new Date('2026-06-15T00:00:00Z')).length, 7);
  });
});

describe('parseMonthKey', () => {
  it('extracts year correctly', () => {
    assert.equal(parseMonthKey('2026-06').year, 2026);
  });

  it('extracts month correctly', () => {
    assert.equal(parseMonthKey('2026-06').month, 6);
  });

  it('extracts January month as 1', () => {
    assert.equal(parseMonthKey('2026-01').month, 1);
  });

  it('extracts December month as 12', () => {
    assert.equal(parseMonthKey('2025-12').month, 12);
  });
});

describe('month key comparison', () => {
  it('later month key is lexicographically greater', () => {
    assert.ok('2026-06' > '2026-05');
  });

  it('later year is lexicographically greater', () => {
    assert.ok('2027-01' > '2026-12');
  });

  it('keys can be sorted newest-first with String.localeCompare descending', () => {
    const keys = ['2025-11', '2026-01', '2025-12'];
    const sorted = keys.sort((a, b) => String(b).localeCompare(String(a)));
    assert.deepEqual(sorted, ['2026-01', '2025-12', '2025-11']);
  });
});
