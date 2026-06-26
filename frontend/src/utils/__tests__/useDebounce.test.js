import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 200));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('a');
  });

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('b');
  });

  it('only uses the last value when updated rapidly', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    rerender({ v: 'c' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 100), {
      initialProps: { v: 0 },
    });
    rerender({ v: 42 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(42);
  });
});
