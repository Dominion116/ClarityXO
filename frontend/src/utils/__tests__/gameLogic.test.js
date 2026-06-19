import { describe, it, expect } from "vitest";
import {
  checkLine,
  checkWinner,
  wouldWin,
  findWinningMove,
  chooseAiMove,
  chooseAiMoveEasy,
  chooseAiMoveHard,
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

describe("findWinningMove — finds diagonal winning move", () => {
  it("finds index 8 to complete X main diagonal", () => {
    expect(findWinningMove([X,E,E, E,X,E, E,E,E], X)).toBe(8);
  });

  it("finds index 4 to complete O anti-diagonal with O at 2 and 6", () => {
    expect(findWinningMove([E,E,O, E,E,E, O,E,E], O)).toBe(4);
  });
});

describe("findWinningMove — returns -1 when no winning move exists", () => {
  it("returns -1 for an empty board", () => {
    expect(findWinningMove([E,E,E, E,E,E, E,E,E], X)).toBe(-1);
  });

  it("returns -1 when player has only one piece on board", () => {
    expect(findWinningMove([X,E,E, E,E,E, E,E,E], X)).toBe(-1);
  });

  it("returns -1 when two-in-a-row is blocked by opponent", () => {
    // X X O in row 0 — index 2 is taken by O so no win possible on row 0
    expect(findWinningMove([X,X,O, E,E,E, E,E,E], X)).toBe(-1);
  });
});

// ── chooseAiMove ─────────────────────────────────────────────────────────────

describe("chooseAiMove — takes winning move when available", () => {
  it("completes row 1 for O when two Os are in row 1", () => {
    const board = [X,E,E, O,O,E, E,E,X];
    expect(chooseAiMove(board)).toBe(5);
  });

  it("completes column 2 for O when two Os are in column 2", () => {
    const board = [E,E,O, E,E,O, E,E,E];
    expect(chooseAiMove(board)).toBe(8);
  });

  it("completes main diagonal for O when O is at 0 and 4", () => {
    const board = [O,X,E, E,O,E, E,E,E];
    expect(chooseAiMove(board)).toBe(8);
  });
});

describe("chooseAiMove — blocks player threat when no AI win", () => {
  it("blocks X completing row 0 at index 2", () => {
    const board = [X,X,E, E,O,E, E,E,E];
    expect(chooseAiMove(board)).toBe(2);
  });

  it("blocks X completing column 0 at index 6", () => {
    const board = [X,O,E, X,E,E, E,E,E];
    expect(chooseAiMove(board)).toBe(6);
  });

  it("blocks X completing main diagonal at index 8", () => {
    const board = [X,O,E, E,X,E, E,E,E];
    expect(chooseAiMove(board)).toBe(8);
  });
});

describe("chooseAiMove — prefers winning over blocking", () => {
  it("takes winning move even when player also has a two-in-a-row", () => {
    // O can win at index 8 (column 2: 2,5,8); X threatens row 0 (0,1,2)
    // O should win rather than block
    const board = [X,X,O, E,E,O, E,E,E];
    expect(chooseAiMove(board)).toBe(8);
  });

  it("O wins anti-diagonal even when X threatens a row", () => {
    const board = [X,X,O, E,O,E, E,E,E];
    expect(chooseAiMove(board)).toBe(6);
  });
});

describe("chooseAiMove — takes center when available and no threats", () => {
  it("plays center (index 4) on an empty board", () => {
    expect(chooseAiMove([E,E,E, E,E,E, E,E,E])).toBe(4);
  });

  it("plays center when only one corner is occupied by X", () => {
    expect(chooseAiMove([X,E,E, E,E,E, E,E,E])).toBe(4);
  });
});

describe("chooseAiMove — takes corner when center is occupied", () => {
  it("plays a corner when center is taken by X and no threats exist", () => {
    const move = chooseAiMove([E,E,E, E,X,E, E,E,E]);
    expect([0, 2, 6, 8]).toContain(move);
  });

  it("plays a corner when center is taken by O and no threats exist", () => {
    const move = chooseAiMove([E,E,E, E,O,E, E,E,E]);
    expect([0, 2, 6, 8]).toContain(move);
  });

  it("plays the first available corner (0) when center taken and corners 2,6,8 are occupied", () => {
    // center=X, corners 2,6,8 taken — only corner 0 remains
    const board = [E,E,X, E,X,E, X,E,X];
    expect(chooseAiMove(board)).toBe(0);
  });
});

describe("chooseAiMove — takes edge as last resort", () => {
  it("plays an edge when center and all corners are occupied", () => {
    // center=O, corners=X, edges empty
    const board = [X,E,X, E,O,E, X,E,X];
    const move = chooseAiMove(board);
    expect([1, 3, 5, 7]).toContain(move);
  });

  it("plays edge index 1 when it is the only remaining cell in its row group", () => {
    // Only edges left, no win/block scenario
    const board = [X,E,X, O,O,X, X,E,O];
    const move = chooseAiMove(board);
    expect([1, 7]).toContain(move);
  });
});

// ── getWinningLine ───────────────────────────────────────────────────────────

describe("getWinningLine — row 0", () => {
  it("returns [0,1,2] when X wins row 0", () => {
    expect(getWinningLine([X,X,X, E,E,E, E,E,E])).toEqual([0,1,2]);
  });

  it("returns [0,1,2] when O wins row 0", () => {
    expect(getWinningLine([O,O,O, E,E,E, E,E,E])).toEqual([0,1,2]);
  });
});

describe("getWinningLine — row 1", () => {
  it("returns [3,4,5] when X wins row 1", () => {
    expect(getWinningLine([E,E,E, X,X,X, E,E,E])).toEqual([3,4,5]);
  });

  it("returns [3,4,5] when O wins row 1", () => {
    expect(getWinningLine([E,E,E, O,O,O, E,E,E])).toEqual([3,4,5]);
  });
});

describe("getWinningLine — row 2", () => {
  it("returns [6,7,8] when X wins row 2", () => {
    expect(getWinningLine([E,E,E, E,E,E, X,X,X])).toEqual([6,7,8]);
  });

  it("returns [6,7,8] when O wins row 2", () => {
    expect(getWinningLine([E,E,E, E,E,E, O,O,O])).toEqual([6,7,8]);
  });
});

describe("getWinningLine — column 0", () => {
  it("returns [0,3,6] when X wins column 0", () => {
    expect(getWinningLine([X,E,E, X,E,E, X,E,E])).toEqual([0,3,6]);
  });

  it("returns [0,3,6] when O wins column 0", () => {
    expect(getWinningLine([O,E,E, O,E,E, O,E,E])).toEqual([0,3,6]);
  });
});

describe("getWinningLine — column 1", () => {
  it("returns [1,4,7] when X wins column 1", () => {
    expect(getWinningLine([E,X,E, E,X,E, E,X,E])).toEqual([1,4,7]);
  });

  it("returns [1,4,7] when O wins column 1", () => {
    expect(getWinningLine([E,O,E, E,O,E, E,O,E])).toEqual([1,4,7]);
  });
});

describe("getWinningLine — column 2", () => {
  it("returns [2,5,8] when X wins column 2", () => {
    expect(getWinningLine([E,E,X, E,E,X, E,E,X])).toEqual([2,5,8]);
  });

  it("returns [2,5,8] when O wins column 2", () => {
    expect(getWinningLine([E,E,O, E,E,O, E,E,O])).toEqual([2,5,8]);
  });
});

describe("getWinningLine — main diagonal (0-4-8)", () => {
  it("returns [0,4,8] when X wins main diagonal", () => {
    expect(getWinningLine([X,E,E, E,X,E, E,E,X])).toEqual([0,4,8]);
  });

  it("returns [0,4,8] when O wins main diagonal", () => {
    expect(getWinningLine([O,E,E, E,O,E, E,E,O])).toEqual([0,4,8]);
  });
});

describe("getWinningLine — anti-diagonal (2-4-6)", () => {
  it("returns [2,4,6] when X wins anti-diagonal", () => {
    expect(getWinningLine([E,E,X, E,X,E, X,E,E])).toEqual([2,4,6]);
  });

  it("returns [2,4,6] when O wins anti-diagonal", () => {
    expect(getWinningLine([E,E,O, E,O,E, O,E,E])).toEqual([2,4,6]);
  });
});

describe("getWinningLine — null for empty board", () => {
  it("returns null for a fully empty board", () => {
    expect(getWinningLine([E,E,E, E,E,E, E,E,E])).toBeNull();
  });

  it("returns null for a board with a single piece", () => {
    expect(getWinningLine([X,E,E, E,E,E, E,E,E])).toBeNull();
  });
});

describe("getWinningLine — null when no three-in-a-row", () => {
  it("returns null for a draw board (no winner)", () => {
    expect(getWinningLine([X,O,X, O,O,X, X,X,O])).toBeNull();
  });

  it("returns null when both players have two in a row but neither has three", () => {
    expect(getWinningLine([X,X,O, O,O,X, E,E,E])).toBeNull();
  });

  it("returns null for a mid-game board with no current winner", () => {
    expect(getWinningLine([X,O,E, E,X,E, E,E,O])).toBeNull();
  });

  it("returns null when pieces are scattered with no line", () => {
    expect(getWinningLine([X,E,O, E,E,E, O,E,X])).toBeNull();
  });
});

// ── chooseAiMoveEasy — valid cell selection ───────────────────────────────────

describe("chooseAiMoveEasy — returns a valid empty cell index", () => {
  it("returns an index between 0 and 8 on an empty board", () => {
    const move = chooseAiMoveEasy([E,E,E, E,E,E, E,E,E]);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it("returned index is empty on the given board", () => {
    const board = [X,O,X, O,X,O, E,E,E];
    const move = chooseAiMoveEasy(board);
    expect(board[move]).toBe(E);
  });

  it("only selects from cells 6, 7, or 8 when those are the only empty ones", () => {
    const board = [X,O,X, O,X,O, E,E,E];
    const move = chooseAiMoveEasy(board);
    expect([6, 7, 8]).toContain(move);
  });
});

describe("chooseAiMoveEasy — edge cases", () => {
  it("returns -1 when the board is completely full", () => {
    expect(chooseAiMoveEasy([X,O,X, O,X,O, O,X,O])).toBe(-1);
  });

  it("returns the only available index when one cell remains", () => {
    expect(chooseAiMoveEasy([X,O,X, O,X,O, X,O,E])).toBe(8);
  });
});
