import { describe, it, expect } from "vitest";
import {
  checkWinner,
  chooseAiMove,
  wouldWin,
  findWinningMove,
  getWinningLine,
} from "../gameLogic.js";
import { EMPTY, PLAYER_X, PLAYER_O } from "../constants.js";

const E = EMPTY;
const X = PLAYER_X;
const O = PLAYER_O;

function applyMove(board, index, player) {
  const next = [...board];
  next[index] = player;
  return next;
}

// ── AI never plays on an occupied cell ───────────────────────────────────────

describe("AI never plays on an occupied cell", () => {
  it("AI does not play on a cell already taken by X", () => {
    const board = [X,E,E, E,O,E, E,E,E];
    const move = chooseAiMove(board);
    expect(board[move]).toBe(E);
  });

  it("AI does not play on a cell already taken by O", () => {
    const board = [X,E,E, E,O,E, X,E,E];
    const move = chooseAiMove(board);
    expect(board[move]).toBe(E);
  });

  it("AI move is in range 0-8 for a typical mid-game board", () => {
    const board = [X,O,X, O,E,E, E,E,E];
    const move = chooseAiMove(board);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });
});

// ── AI always wins or draws when playing optimally ────────────────────────────

describe("AI always wins or draws when playing optimally", () => {
  function simulateGame(playerMoves) {
    let board = [E,E,E, E,E,E, E,E,E];
    for (const pIdx of playerMoves) {
      if (board[pIdx] !== E) break;
      board = applyMove(board, pIdx, X);
      if (checkWinner(board) === X) return "X";
      const aiIdx = chooseAiMove(board);
      if (aiIdx === -1) return "draw";
      board = applyMove(board, aiIdx, O);
      if (checkWinner(board) === O) return "O";
    }
    return "draw";
  }

  it("AI wins or draws when player plays corners only", () => {
    const result = simulateGame([0, 2, 6, 8, 1]);
    expect(["O", "draw"]).toContain(result);
  });

  it("AI wins or draws when player plays edges only", () => {
    const result = simulateGame([1, 3, 5, 7]);
    expect(["O", "draw"]).toContain(result);
  });

  it("AI wins or draws when player plays center then corners", () => {
    const result = simulateGame([4, 0, 2, 6, 8]);
    expect(["O", "draw"]).toContain(result);
  });
});
