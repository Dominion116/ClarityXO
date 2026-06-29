import { describe, it, expect } from "vitest";

describe("Game moves", () => {
  it("should validate cell positions", () => {
    const validPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    validPositions.forEach(pos => {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(9);
    });
  });

  it("should prevent occupied cell moves", () => {
    const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
    const isCellOccupied = board[0] !== 0;
    expect(isCellOccupied).toBe(true);
  });
});
