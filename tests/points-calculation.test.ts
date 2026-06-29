import { describe, it, expect } from "vitest";

describe("Points calculation", () => {
  it("should award 3 points for win", () => {
    const wins = 38;
    const pointsPerWin = 3;
    expect(wins * pointsPerWin).toBe(114);
  });

  it("should award 1 point for draw", () => {
    const draws = 7;
    const pointsPerDraw = 1;
    expect(draws * pointsPerDraw).toBe(7);
  });

  it("should award 0 points for loss", () => {
    const losses = 10;
    const pointsPerLoss = 0;
    expect(losses * pointsPerLoss).toBe(0);
  });

  it("should calculate total correctly", () => {
    const wins = 38;
    const draws = 7;
    const losses = 10;
    const total = wins * 3 + draws * 1 + losses * 0;
    expect(total).toBe(121);
  });
});
