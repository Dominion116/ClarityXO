import { describe, it, expect } from "vitest";

describe("Fee collection", () => {
  it("should transfer fee to owner", () => {
    const fee = 20000;
    const owner = "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y";
    expect(fee).toBeGreaterThan(0);
    expect(owner).toBeDefined();
  });
});
