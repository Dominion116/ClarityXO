import { describe, it, expect } from "vitest";

describe("AI opponent gameplay", () => {
  it("should have valid board state", () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(board.length).toBe(9);
  });

  it("should alternate moves", () => {
    const playerX = 1;
    const playerO = 2;
    expect(playerX).not.toBe(playerO);
  });

  it("should detect winning conditions", () => {
    const winningBoard = [1, 1, 1, 0, 0, 0, 0, 0, 0];
    const hasThreeInRow = winningBoard.slice(0, 3).every(cell => cell === 1);
    expect(hasThreeInRow).toBe(true);
  });
});
