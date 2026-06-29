import { describe, it, expect } from "vitest";

describe("Winner address validation", () => {
  it("should accept valid principal format", () => {
    const principal = "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY";
    expect(principal).toMatch(/^SP[A-Z0-9]{32}$/);
  });
});
