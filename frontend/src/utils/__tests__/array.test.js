import { describe, it, expect } from 'vitest';
import { chunk, unique, sortBy, groupBy, sumBy } from '../array';

describe('chunk', () => {
  it('splits array into chunks of given size', () => {
    expect(chunk([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]]);
  });

  it('returns single chunk when size >= length', () => {
    expect(chunk([1,2,3], 5)).toEqual([[1,2,3]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('handles chunk size of 1', () => {
    expect(chunk([1,2,3], 1)).toEqual([[1],[2],[3]]);
  });
});

describe('unique', () => {
  it('removes duplicate primitives', () => {
    expect(unique([1,2,2,3,3,3])).toEqual([1,2,3]);
  });

  it('returns same array when all unique', () => {
    expect(unique([1,2,3])).toEqual([1,2,3]);
  });

  it('deduplicates objects by key', () => {
    const arr = [{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }];
    const result = unique(arr, 'id');
    expect(result).toHaveLength(2);
    expect(result[0].v).toBe('a');
  });
});

describe('sortBy', () => {
  const arr = [{ n: 3 }, { n: 1 }, { n: 2 }];

  it('sorts ascending by default', () => {
    const result = sortBy(arr, 'n');
    expect(result.map(x => x.n)).toEqual([1,2,3]);
  });

  it('sorts descending', () => {
    const result = sortBy(arr, 'n', 'desc');
    expect(result.map(x => x.n)).toEqual([3,2,1]);
  });

  it('does not mutate original array', () => {
    const copy = [...arr];
    sortBy(arr, 'n');
    expect(arr).toEqual(copy);
  });
});

describe('groupBy', () => {
  it('groups objects by key', () => {
    const arr = [{ type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 3 }];
    const groups = groupBy(arr, 'type');
    expect(groups.a).toHaveLength(2);
    expect(groups.b).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBy([], 'key')).toEqual({});
  });
});

describe('sumBy', () => {
  it('sums numeric field across items', () => {
    const arr = [{ pts: 3 }, { pts: 5 }, { pts: 1 }];
    expect(sumBy(arr, 'pts')).toBe(9);
  });

  it('returns 0 for empty array', () => {
    expect(sumBy([], 'pts')).toBe(0);
  });

  it('treats missing field as 0', () => {
    expect(sumBy([{ pts: 3 }, {}], 'pts')).toBe(3);
  });
});
