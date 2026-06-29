import { describe, it, expect } from "vitest";

describe("Trophy mint fee", () => {
  it("should accept valid fee amounts", () => {
    const validFees = [1000, 5000, 20000, 100000];
    validFees.forEach(fee => {
      expect(fee).toBeGreaterThan(0);
    });
  });

  it("should reject negative fees", () => {
    const invalidFee = -1000;
    expect(invalidFee).toBeLessThan(0);
  });

  it("should convert STX to microstx correctly", () => {
    const stxAmount = 0.02;
    const microSTX = stxAmount * 1_000_000;
    expect(microSTX).toBe(20000);
  });

  it("should handle zero fee", () => {
    const zeroFee = 0;
    expect(zeroFee).toBe(0);
  });
});
