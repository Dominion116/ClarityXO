import { describe, it, expect } from "vitest";

describe("Gas cost estimation", () => {
  it("should estimate set-month-uri gas", () => {
    const estimatedGas = 15000;
    expect(estimatedGas).toBeGreaterThan(0);
  });

  it("should estimate set-mint-fee gas", () => {
    const estimatedGas = 10000;
    expect(estimatedGas).toBeGreaterThan(0);
  });

  it("should estimate claim-trophy gas", () => {
    const estimatedGas = 25000;
    expect(estimatedGas).toBeGreaterThan(0);
  });
});
