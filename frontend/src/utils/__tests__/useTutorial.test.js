import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorial, TUTORIAL_STEPS } from '../../hooks/useTutorial';

const STORAGE_KEY = 'clarityxo.tutorialComplete';

describe('useTutorial', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('activates tutorial on first visit (no completion flag)', () => {
    const { result } = renderHook(() => useTutorial());
    expect(result.current.isActive).toBe(true);
  });

  it('does not activate tutorial when completion flag is set', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    const { result } = renderHook(() => useTutorial());
    expect(result.current.isActive).toBe(false);
  });

  it('starts at step 0', () => {
    const { result } = renderHook(() => useTutorial());
    expect(result.current.step).toBe(0);
  });

  it('next() advances step by 1', () => {
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.next());
    expect(result.current.step).toBe(1);
  });

  it('prev() decrements step by 1', () => {
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.next());
    act(() => result.current.prev());
    expect(result.current.step).toBe(0);
  });

  it('prev() does not go below 0', () => {
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.prev());
    expect(result.current.step).toBe(0);
  });

  it('skip() sets isActive to false', () => {
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.skip());
    expect(result.current.isActive).toBe(false);
  });

  it('skip() writes completion flag to localStorage', () => {
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.skip());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('next() on last step sets isActive to false', () => {
    const { result } = renderHook(() => useTutorial());
    // Advance to last step
    for (let i = 0; i < TUTORIAL_STEPS.length - 1; i++) {
      act(() => result.current.next());
    }
    act(() => result.current.next());
    expect(result.current.isActive).toBe(false);
  });

  it('next() on last step writes completion flag', () => {
    const { result } = renderHook(() => useTutorial());
    for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
      act(() => result.current.next());
    }
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('restart() resets step to 0 and sets isActive to true', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    const { result } = renderHook(() => useTutorial());
    act(() => result.current.restart());
    expect(result.current.isActive).toBe(true);
    expect(result.current.step).toBe(0);
  });

  it('currentStep returns the step definition for current index', () => {
    const { result } = renderHook(() => useTutorial());
    expect(result.current.currentStep).toBe(TUTORIAL_STEPS[0]);
  });

  it('totalSteps equals TUTORIAL_STEPS length', () => {
    const { result } = renderHook(() => useTutorial());
    expect(result.current.totalSteps).toBe(TUTORIAL_STEPS.length);
  });
});
