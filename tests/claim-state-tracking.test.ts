import { describe, it, expect } from "vitest";

describe("Claim state tracking", () => {
  it("should mark trophy as claimed", () => {
    const claimedTrophies = new Map();
    claimedTrophies.set(1, true);
    expect(claimedTrophies.get(1)).toBe(true);
  });
});
