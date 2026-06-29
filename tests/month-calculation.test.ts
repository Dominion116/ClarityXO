import { describe, it, expect } from "vitest";

describe("Month calculation", () => {
  it("should calculate month from burn block height", () => {
    const burnBlockHeight = 955200;
    const blocksPerMonth = 4320;
    const month = Math.floor(burnBlockHeight / blocksPerMonth);
    expect(month).toBe(221);
  });

  it("should handle month boundaries", () => {
    const month219Start = 218 * 4320;
    const month219End = 219 * 4320 - 1;
    expect(month219Start).toBeLessThan(month219End);
  });
});
