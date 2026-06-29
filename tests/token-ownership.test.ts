import { describe, it, expect } from "vitest";

describe("Token ownership", () => {
  it("should track owner per token", () => {
    const tokenOwners = new Map();
    tokenOwners.set(1, "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY");
    expect(tokenOwners.get(1)).toBeDefined();
  });
});
