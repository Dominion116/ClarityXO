import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'clarityxo.tutorialComplete';

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ClarityXO',
    body: 'An on-chain tic-tac-toe game running on the Stacks blockchain — every move is a real transaction.',
    target: null,
  },
  {
    id: 'wallet',
    title: 'Connect Your Wallet',
    body: 'Click the Connect button to link your Hiro or Leather wallet. You need a wallet to play on-chain.',
    target: '#btn-connect',
  },
  {
    id: 'board',
    title: 'The Game Board',
    body: 'You are X. Click any empty cell to place your marker. You play against the AI or another player.',
    target: '.board',
  },
  {
    id: 'new-game',
    title: 'Start a Game',
    body: 'Click New Game to broadcast a start-game transaction. Wait ~6 seconds for Stacks to confirm it.',
    target: '#btn-new',
  },
  {
    id: 'move',
    title: 'Making a Move',
    body: 'Each move is a transaction. After you click a cell, the board updates optimistically and syncs from the chain.',
    target: '.board',
  },
  {
    id: 'scoring',
    title: 'Scoring',
    body: 'Win vs AI = 3 pts · Win vs Player = 5 pts · Draw = 1 pt · Loss = 0 pts. Points are tracked monthly.',
    target: null,
  },
  {
    id: 'pvp',
    title: 'Try PvP Mode',
    body: 'Head to the PvP Lobby to challenge another wallet. Each move is signed by the correct player.',
    target: null,
  },
];

export function useTutorial() {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!done) setIsActive(true);
    } catch {}
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= TUTORIAL_STEPS.length - 1) {
        setIsActive(false);
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
        return s;
      }
      return s + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const skip = useCallback(() => {
    setIsActive(false);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
  }, []);

  const restart = useCallback(() => {
    setStep(0);
    setIsActive(true);
  }, []);

  return {
    isActive,
    step,
    currentStep: TUTORIAL_STEPS[step],
    totalSteps: TUTORIAL_STEPS.length,
    next,
    prev,
    skip,
    restart,
  };
}
