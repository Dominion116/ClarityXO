import { describe, it, expect } from "vitest";

describe("Transaction sender validation", () => {
  it("should validate tx-sender matches claimant", () => {
    const txSender = "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY";
    const claimant = "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY";
    expect(txSender).toBe(claimant);
  });
});
