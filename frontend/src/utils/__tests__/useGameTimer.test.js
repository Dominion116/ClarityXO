import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from '../../hooks/useGameTimer';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useGameTimer', () => {
  it('starts with elapsed 0 and not running', () => {
    const { result } = renderHook(() => useGameTimer());
    expect(result.current.elapsed).toBe(0);
    expect(result.current.running).toBe(false);
  });

  it('start() sets running to true', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    expect(result.current.running).toBe(true);
  });

  it('elapsed increments each second after start', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsed).toBe(3);
  });

  it('stop() sets running to false', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(result.current.running).toBe(false);
  });

  it('stop() freezes elapsed at current value', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.elapsed).toBe(5);
  });

  it('reset() sets elapsed back to 0', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(4000));
    act(() => result.current.reset());
    expect(result.current.elapsed).toBe(0);
  });

  it('reset() stops the timer', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => result.current.reset());
    expect(result.current.running).toBe(false);
  });

  it('calling start() twice does not create duplicate intervals', () => {
    const { result } = renderHook(() => useGameTimer());
    act(() => result.current.start());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsed).toBe(3);
  });
});
