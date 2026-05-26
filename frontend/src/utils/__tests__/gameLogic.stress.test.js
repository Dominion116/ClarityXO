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
