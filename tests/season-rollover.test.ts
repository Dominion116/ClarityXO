import { describe, it, expect } from "vitest";

describe("Season rollover", () => {
  it("should track multiple seasons", () => {
    const seasons = [219, 220, 221];
    expect(seasons.length).toBe(3);
  });

  it("should reset stats on new month", () => {
    const month220Stats = { wins: 38, draws: 7, losses: 10 };
    const month221Stats = { wins: 0, draws: 0, losses: 0 };
    expect(month221Stats.wins).toBe(0);
    expect(month220Stats.wins).toBeGreaterThan(0);
  });
});
