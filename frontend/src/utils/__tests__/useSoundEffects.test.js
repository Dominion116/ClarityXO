import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

// Silence Web Audio in test environment
const mockAudioCtx = {
  state: 'running',
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    type: '',
    frequency: { setValueAtTime: vi.fn() },
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  })),
  currentTime: 0,
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioCtx));
vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioCtx));

describe('useSoundEffects', () => {
  beforeEach(() => {
    localStorage.clear();
    window.__clarityxoAudioCtx = undefined;
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initialises isMuted to false when localStorage is empty', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.isMuted).toBe(false);
  });

  it('reads muted=true from localStorage on init', () => {
    localStorage.setItem('clarityxo.muted', 'true');
    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.isMuted).toBe(true);
  });

  it('toggleMute flips isMuted from false to true', () => {
    const { result } = renderHook(() => useSoundEffects());
    act(() => result.current.toggleMute());
    expect(result.current.isMuted).toBe(true);
  });

  it('toggleMute flips isMuted from true to false', () => {
    localStorage.setItem('clarityxo.muted', 'true');
    const { result } = renderHook(() => useSoundEffects());
    act(() => result.current.toggleMute());
    expect(result.current.isMuted).toBe(false);
  });

  it('toggleMute persists new value to localStorage', () => {
    const { result } = renderHook(() => useSoundEffects());
    act(() => result.current.toggleMute());
    expect(localStorage.getItem('clarityxo.muted')).toBe('true');
  });

  it('playClick does not throw when not muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playClick()).not.toThrow();
  });

  it('playWin does not throw when not muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playWin()).not.toThrow();
  });

  it('playLoss does not throw when not muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playLoss()).not.toThrow();
  });

  it('playDraw does not throw when not muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playDraw()).not.toThrow();
  });

  it('play functions are silent when muted', () => {
    localStorage.setItem('clarityxo.muted', 'true');
    const { result } = renderHook(() => useSoundEffects());
    result.current.playClick();
    result.current.playWin();
    result.current.playLoss();
    result.current.playDraw();
    // No oscillators created when muted
    expect(mockAudioCtx.createOscillator).not.toHaveBeenCalled();
  });
});
