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

// ── wouldWin ─────────────────────────────────────────────────────────────────

describe("wouldWin — placing creates a winner", () => {
  it("returns true when X completing row 0 wins", () => {
    const board = [X,X,E, E,E,E, E,E,E];
    expect(wouldWin(board, 2, X)).toBe(true);
  });

  it("returns true when O completing column 2 wins", () => {
    const board = [E,E,O, E,E,O, E,E,E];
    expect(wouldWin(board, 8, O)).toBe(true);
  });

  it("returns true when X completing main diagonal wins", () => {
    const board = [X,E,E, E,X,E, E,E,E];
    expect(wouldWin(board, 8, X)).toBe(true);
  });
});

describe("wouldWin — placing does not create a winner", () => {
  it("returns false when placing on empty board at index 0", () => {
    expect(wouldWin([E,E,E, E,E,E, E,E,E], 0, X)).toBe(false);
  });

  it("returns false when X has two pieces but third index does not complete any line", () => {
    const board = [X,E,E, E,X,E, E,E,E];
    expect(wouldWin(board, 1, X)).toBe(false);
  });

  it("returns false when O places but the winning cell belongs to X's line only", () => {
    const board = [X,X,E, E,E,E, E,E,E];
    expect(wouldWin(board, 2, O)).toBe(false);
  });
});

describe("wouldWin — does not mutate original board", () => {
  it("original board is unchanged after wouldWin call that returns true", () => {
    const board = [X,X,E, E,E,E, E,E,E];
    const copy  = [...board];
    wouldWin(board, 2, X);
    expect(board).toEqual(copy);
  });

  it("original board is unchanged after wouldWin call that returns false", () => {
    const board = [E,E,E, E,E,E, E,E,E];
    const copy  = [...board];
    wouldWin(board, 4, X);
    expect(board).toEqual(copy);
  });
});

// ── findWinningMove ───────────────────────────────────────────────────────────

describe("findWinningMove — finds row winning move", () => {
  it("finds index 2 to complete X row 0", () => {
    expect(findWinningMove([X,X,E, E,E,E, E,E,E], X)).toBe(2);
  });

  it("finds index 5 to complete O row 1", () => {
    expect(findWinningMove([E,E,E, O,O,E, E,E,E], O)).toBe(5);
  });

  it("finds index 6 to complete X row 2", () => {
    expect(findWinningMove([E,E,E, E,E,E, E,X,X], X)).toBe(6);
  });
});

describe("findWinningMove — finds column winning move", () => {
  it("finds index 6 to complete O column 0", () => {
    expect(findWinningMove([O,E,E, O,E,E, E,E,E], O)).toBe(6);
  });

  it("finds index 7 to complete X column 1", () => {
    expect(findWinningMove([E,X,E, E,X,E, E,E,E], X)).toBe(7);
  });

  it("finds index 2 to complete X column 2", () => {
    expect(findWinningMove([E,E,E, E,E,X, E,E,X], X)).toBe(2);
  });
});
