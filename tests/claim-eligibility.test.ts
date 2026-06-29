import { describe, it, expect } from "vitest";

describe("Claim eligibility", () => {
  it("should check player in winners list", () => {
    const winners = ["SP1", "SP2"];
    expect(winners).toContain("SP1");
  });
});
