import { describe, it, expect } from "vitest";
import {
  checkLine,
  checkWinner,
  wouldWin,
  findWinningMove,
  chooseAiMove,
  getWinningLine,
} from "../gameLogic.js";
import { EMPTY, PLAYER_X, PLAYER_O } from "../constants.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const E = EMPTY;
const X = PLAYER_X;
const O = PLAYER_O;

// Board where X wins top row
const xWinsRow0   = [X,X,X, E,E,E, E,E,E];
// Board where O wins row 1
const oWinsRow1   = [E,E,E, O,O,O, E,E,E];
// Empty board
const emptyBoard  = [E,E,E, E,E,E, E,E,E];
// Partial board, no winner
const partial     = [X,O,E, E,X,E, E,E,O];

// ── checkLine ───────────────────────────────────────────────────────────────

describe("checkLine — truthful matches", () => {
  it("returns true when all three cells are PLAYER_X", () => {
    expect(checkLine(X, X, X)).toBe(true);
  });

  it("returns true when all three cells are PLAYER_O", () => {
    expect(checkLine(O, O, O)).toBe(true);
  });

  it("returns true for any non-zero value repeated three times", () => {
    expect(checkLine(2, 2, 2)).toBe(true);
  });

  it("also works for value 1 (PLAYER_X sentinel)", () => {
    expect(checkLine(1, 1, 1)).toBe(true);
  });
});
