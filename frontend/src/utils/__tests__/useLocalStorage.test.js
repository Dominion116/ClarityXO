import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns defaultValue when key is not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify(99));
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    expect(result.current[0]).toBe(99);
  });

  it('set() updates the state value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => result.current[1](7));
    expect(result.current[0]).toBe(7);
  });

  it('set() persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => result.current[1](7));
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe(7);
  });

  it('set() accepts a function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));
    act(() => result.current[1](n => n + 5));
    expect(result.current[0]).toBe(15);
  });

  it('remove() resets value to default', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => result.current[1]('changed'));
    act(() => result.current[2]());
    expect(result.current[0]).toBe('default');
  });

  it('remove() deletes key from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => result.current[1](5));
    act(() => result.current[2]());
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useLocalStorage('obj-key', {}));
    act(() => result.current[1]({ name: 'alice' }));
    expect(result.current[0]).toEqual({ name: 'alice' });
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });
});
