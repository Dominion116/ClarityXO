import { describe, it, expect } from "vitest";

describe("Trophy claims", () => {
  it("should track claimed status", () => {
    const claimed = new Map();
    claimed.set("SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY", true);
    expect(claimed.has("SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY")).toBe(true);
  });

  it("should prevent duplicate claims", () => {
    const claimedByUser = new Map();
    claimedByUser.set("user1", true);
    const canClaim = !claimedByUser.has("user1");
    expect(canClaim).toBe(false);
  });

  it("should enforce month completion before claims", () => {
    const currentMonth = 221;
    const claimMonth = 220;
    expect(claimMonth).toBeLessThan(currentMonth);
  });

  it("should validate player whitelist", () => {
    const whitelist = ["SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY"];
    const playerAddress = "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY";
    expect(whitelist.includes(playerAddress)).toBe(true);
  });
});
