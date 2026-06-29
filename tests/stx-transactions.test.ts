import { describe, it, expect } from "vitest";

describe("STX transactions", () => {
  it("should convert STX to microSTX", () => {
    const stx = 0.02;
    const microSTX = Math.round(stx * 1_000_000);
    expect(microSTX).toBe(20000);
  });
});
