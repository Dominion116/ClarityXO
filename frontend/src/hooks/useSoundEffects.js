import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'clarityxo.muted';

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!window.__clarityxoAudioCtx) {
    window.__clarityxoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.__clarityxoAudioCtx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.2) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const mutedRef = useRef(isMuted);
  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const playClick = useCallback(() => {
    if (mutedRef.current) return;
    playTone(440, 0.08, 'triangle', 0.15);
  }, []);

  const playWin = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.25);
    });
  }, []);

  const playLoss = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    [330, 277].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  }, []);

  const playDraw = useCallback(() => {
    if (mutedRef.current) return;
    playTone(370, 0.3, 'square', 0.08);
  }, []);

  const playChallengeSent = useCallback(() => {
    if (mutedRef.current) return;
    playTone(880, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.12), 120);
  }, []);

  const playChallengeReceived = useCallback(() => {
    if (mutedRef.current) return;
    [660, 880, 1100].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.14), i * 100);
    });
  }, []);

  return {
    isMuted,
    toggleMute,
    playClick,
    playWin,
    playLoss,
    playDraw,
    playChallengeSent,
    playChallengeReceived,
  };
}
