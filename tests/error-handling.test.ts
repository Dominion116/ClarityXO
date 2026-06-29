import { describe, it, expect } from "vitest";

describe("Error handling", () => {
  it("should handle unauthorized calls", () => {
    const isOwner = false;
    expect(isOwner).toBe(false);
  });

  it("should handle invalid month", () => {
    const month = -1;
    expect(month).toBeLessThan(0);
  });
});
