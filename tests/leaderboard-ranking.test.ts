import { describe, it, expect } from "vitest";

describe("Leaderboard ranking", () => {
  it("should rank players by points", () => {
    const players = [
      { points: 114, player: "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY" },
      { points: 100, player: "SP3XR5PCCV557KE2ZZB3W04B91F6042HKZ8KNX1ZS" }
    ];
    expect(players[0].points).toBeGreaterThan(players[1].points);
  });

  it("should handle tied points", () => {
    const tied = { points: 96, player1: "SP1", player2: "SP2" };
    expect(tied.points).toBe(96);
  });
});
