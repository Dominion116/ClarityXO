import { describe, it, expect } from 'vitest';
import { chooseAiMove, checkWinner, checkLine } from '../gameLogic';
import { EMPTY, PLAYER_X, PLAYER_O } from '../constants';

const E = EMPTY;
const X = PLAYER_X;
const O = PLAYER_O;

describe('AI never plays on occupied cell (property test — 100 random boards)', () => {
  function randomBoard() {
    return Array.from({ length: 9 }, () => {
      const r = Math.random();
      return r < 0.33 ? X : r < 0.66 ? O : E;
    });
  }

  it('medium AI always picks an empty cell', () => {
    for (let i = 0; i < 100; i++) {
      const board = randomBoard();
      const hasEmpty = board.some(c => c === E);
      if (!hasEmpty) continue;
      const idx = chooseAiMove([...board], 'medium');
      expect(board[idx]).toBe(E);
    }
  });

  it('hard AI always picks an empty cell', () => {
    for (let i = 0; i < 100; i++) {
      const board = randomBoard();
      const hasEmpty = board.some(c => c === E);
      if (!hasEmpty) continue;
      const winner = checkWinner(board);
      if (winner !== E) continue; // skip finished boards
      const idx = chooseAiMove([...board], 'hard');
      expect(board[idx]).toBe(E);
    }
  });

  it('easy AI always picks an empty cell', () => {
    for (let i = 0; i < 100; i++) {
      const board = randomBoard();
      const hasEmpty = board.some(c => c === E);
      if (!hasEmpty) continue;
      const idx = chooseAiMove([...board], 'easy');
      expect(board[idx]).toBe(E);
    }
  });
});

describe('checkLine symmetric properties', () => {
  it('checkLine(X, X, X) is true', () => {
    expect(checkLine(X, X, X)).toBe(true);
  });

  it('checkLine(O, O, O) is true', () => {
    expect(checkLine(O, O, O)).toBe(true);
  });

  it('checkLine(X, O, X) is false', () => {
    expect(checkLine(X, O, X)).toBe(false);
  });

  it('checkLine(E, E, E) is false (EMPTY does not win)', () => {
    expect(checkLine(E, E, E)).toBe(false);
  });
});

describe('checkWinner covers all 8 win lines', () => {
  const lines = [
    // rows
    [0,1,2], [3,4,5], [6,7,8],
    // cols
    [0,3,6], [1,4,7], [2,5,8],
    // diagonals
    [0,4,8], [2,4,6],
  ];

  for (const [a, b, c] of lines) {
    it(`X wins via cells ${a}-${b}-${c}`, () => {
      const board = Array(9).fill(E);
      board[a] = X; board[b] = X; board[c] = X;
      expect(checkWinner(board)).toBe(X);
    });

    it(`O wins via cells ${a}-${b}-${c}`, () => {
      const board = Array(9).fill(E);
      board[a] = O; board[b] = O; board[c] = O;
      expect(checkWinner(board)).toBe(O);
    });
  }
});
