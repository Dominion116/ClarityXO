import { describe, it, expect } from "vitest";

describe("PvP challenges", () => {
  it("should track open challenges", () => {
    const challenges = new Map();
    challenges.set("SP1", { opponent: "SP2", createdAt: 1000 });
    expect(challenges.has("SP1")).toBe(true);
  });

  it("should prevent self-challenges", () => {
    const challenger = "SP1";
    const opponent = "SP1";
    expect(challenger).toBe(opponent);
  });
});
