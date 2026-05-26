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

describe("checkLine — false when cells differ", () => {
  it("returns false when first and second cells differ", () => {
    expect(checkLine(X, O, X)).toBe(false);
  });

  it("returns false when second and third cells differ", () => {
    expect(checkLine(X, X, O)).toBe(false);
  });

  it("returns false when all three cells differ", () => {
    expect(checkLine(X, O, E)).toBe(false);
  });
});

describe("checkLine — false when any cell is EMPTY", () => {
  it("returns false when first cell is EMPTY", () => {
    expect(checkLine(E, X, X)).toBe(false);
  });

  it("returns false when middle cell is EMPTY", () => {
    expect(checkLine(X, E, X)).toBe(false);
  });

  it("returns false when last cell is EMPTY", () => {
    expect(checkLine(X, X, E)).toBe(false);
  });

  it("returns false when all three cells are EMPTY", () => {
    expect(checkLine(E, E, E)).toBe(false);
  });
});

// ── checkWinner ──────────────────────────────────────────────────────────────

describe("checkWinner — row 0 wins", () => {
  it("returns PLAYER_X when X occupies row 0", () => {
    expect(checkWinner([X,X,X, E,E,E, E,E,E])).toBe(X);
  });

  it("returns PLAYER_O when O occupies row 0", () => {
    expect(checkWinner([O,O,O, E,E,E, E,E,E])).toBe(O);
  });
});

describe("checkWinner — row 1 wins", () => {
  it("returns PLAYER_X when X occupies row 1", () => {
    expect(checkWinner([E,E,E, X,X,X, E,E,E])).toBe(X);
  });

  it("returns PLAYER_O when O occupies row 1", () => {
    expect(checkWinner([E,E,E, O,O,O, E,E,E])).toBe(O);
  });
});

describe("checkWinner — row 2 wins", () => {
  it("returns PLAYER_X when X occupies row 2", () => {
    expect(checkWinner([E,E,E, E,E,E, X,X,X])).toBe(X);
  });

  it("returns PLAYER_O when O occupies row 2", () => {
    expect(checkWinner([E,E,E, E,E,E, O,O,O])).toBe(O);
  });
});

describe("checkWinner — column wins", () => {
  it("returns PLAYER_X when X occupies column 0 (indices 0,3,6)", () => {
    expect(checkWinner([X,E,E, X,E,E, X,E,E])).toBe(X);
  });

  it("returns PLAYER_X when X occupies column 1 (indices 1,4,7)", () => {
    expect(checkWinner([E,X,E, E,X,E, E,X,E])).toBe(X);
  });

  it("returns PLAYER_O when O occupies column 2 (indices 2,5,8)", () => {
    expect(checkWinner([E,E,O, E,E,O, E,E,O])).toBe(O);
  });
});

describe("checkWinner — main diagonal (0-4-8)", () => {
  it("returns PLAYER_X when X occupies main diagonal", () => {
    expect(checkWinner([X,E,E, E,X,E, E,E,X])).toBe(X);
  });

  it("returns PLAYER_O when O occupies main diagonal", () => {
    expect(checkWinner([O,E,E, E,O,E, E,E,O])).toBe(O);
  });
});

describe("checkWinner — anti-diagonal (2-4-6)", () => {
  it("returns PLAYER_X when X occupies anti-diagonal", () => {
    expect(checkWinner([E,E,X, E,X,E, X,E,E])).toBe(X);
  });

  it("returns PLAYER_O when O occupies anti-diagonal", () => {
    expect(checkWinner([E,E,O, E,O,E, O,E,E])).toBe(O);
  });
});

describe("checkWinner — empty board", () => {
  it("returns EMPTY for a fully empty board", () => {
    expect(checkWinner([E,E,E, E,E,E, E,E,E])).toBe(E);
  });

  it("returns EMPTY for a board with one piece", () => {
    expect(checkWinner([X,E,E, E,E,E, E,E,E])).toBe(E);
  });
});

describe("checkWinner — partial boards with no winner", () => {
  it("returns EMPTY when board has 4 pieces and no three-in-a-row", () => {
    expect(checkWinner([X,O,E, O,X,E, E,E,E])).toBe(E);
  });

  it("returns EMPTY for a near-draw board with no winner", () => {
    // X O X / O O X / X X O  — draw, no winner
    expect(checkWinner([X,O,X, O,O,X, X,X,O])).toBe(E);
  });

  it("returns EMPTY when pieces are scattered diagonally without lining up", () => {
    expect(checkWinner([X,E,O, E,E,E, O,E,X])).toBe(E);
  });

  it("returns EMPTY for a board where both players have two in a row but not three", () => {
    expect(checkWinner([X,X,O, O,O,X, E,E,E])).toBe(E);
  });
});
