import { describe, it, expect } from 'vitest';
import { boardFromIndices, countEmpty, countPlayer, emptyIndices, boardToString, isBoardFull, cellIndex, cellCoords } from '../board';
import { EMPTY, PLAYER_X, PLAYER_O } from '../constants';

describe('boardFromIndices', () => {
  it('creates board with X and O at correct positions', () => {
    const board = boardFromIndices([0, 4], [1, 2]);
    expect(board[0]).toBe(PLAYER_X);
    expect(board[4]).toBe(PLAYER_X);
    expect(board[1]).toBe(PLAYER_O);
    expect(board[2]).toBe(PLAYER_O);
    expect(board[3]).toBe(EMPTY);
  });

  it('creates empty board from empty arrays', () => {
    const board = boardFromIndices([], []);
    expect(board).toHaveLength(9);
    expect(board.every(c => c === EMPTY)).toBe(true);
  });
});

describe('countEmpty', () => {
  it('counts 9 empty on blank board', () => {
    expect(countEmpty(Array(9).fill(EMPTY))).toBe(9);
  });

  it('counts correctly after moves', () => {
    const board = boardFromIndices([0, 4], [1]);
    expect(countEmpty(board)).toBe(6);
  });

  it('returns 0 for full board', () => {
    const board = [PLAYER_X, PLAYER_O, PLAYER_X, PLAYER_O, PLAYER_X, PLAYER_O, PLAYER_O, PLAYER_X, PLAYER_O];
    expect(countEmpty(board)).toBe(0);
  });
});

describe('countPlayer', () => {
  it('counts X cells', () => {
    const board = boardFromIndices([0, 2, 4], [1, 3]);
    expect(countPlayer(board, PLAYER_X)).toBe(3);
  });

  it('counts O cells', () => {
    const board = boardFromIndices([0, 2], [1, 3, 5]);
    expect(countPlayer(board, PLAYER_O)).toBe(3);
  });
});

describe('emptyIndices', () => {
  it('returns all 9 indices for empty board', () => {
    expect(emptyIndices(Array(9).fill(EMPTY))).toEqual([0,1,2,3,4,5,6,7,8]);
  });

  it('excludes occupied indices', () => {
    const board = boardFromIndices([0, 4], [1]);
    const empty = emptyIndices(board);
    expect(empty).not.toContain(0);
    expect(empty).not.toContain(1);
    expect(empty).not.toContain(4);
    expect(empty).toHaveLength(6);
  });
});

describe('boardToString', () => {
  it('converts empty board to 9 dots', () => {
    expect(boardToString(Array(9).fill(EMPTY))).toBe('.........');
  });

  it('represents X and O correctly', () => {
    const board = boardFromIndices([0], [1]);
    expect(boardToString(board)).toMatch(/^XO/);
  });
});

describe('isBoardFull', () => {
  it('returns false for empty board', () => {
    expect(isBoardFull(Array(9).fill(EMPTY))).toBe(false);
  });

  it('returns true for full board', () => {
    const board = [PLAYER_X, PLAYER_O, PLAYER_X, PLAYER_O, PLAYER_X, PLAYER_O, PLAYER_O, PLAYER_X, PLAYER_O];
    expect(isBoardFull(board)).toBe(true);
  });
});

describe('cellIndex and cellCoords', () => {
  it('cellIndex(0,0) is 0', () => expect(cellIndex(0,0)).toBe(0));
  it('cellIndex(0,2) is 2', () => expect(cellIndex(0,2)).toBe(2));
  it('cellIndex(1,1) is 4', () => expect(cellIndex(1,1)).toBe(4));
  it('cellIndex(2,2) is 8', () => expect(cellIndex(2,2)).toBe(8));

  it('cellCoords(0) is {row:0, col:0}', () => expect(cellCoords(0)).toEqual({ row: 0, col: 0 }));
  it('cellCoords(4) is {row:1, col:1}', () => expect(cellCoords(4)).toEqual({ row: 1, col: 1 }));
  it('cellCoords(8) is {row:2, col:2}', () => expect(cellCoords(8)).toEqual({ row: 2, col: 2 }));

  it('cellIndex and cellCoords are inverses', () => {
    for (let i = 0; i < 9; i++) {
      const { row, col } = cellCoords(i);
      expect(cellIndex(row, col)).toBe(i);
    }
  });
});
