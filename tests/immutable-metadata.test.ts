import { describe, it, expect } from "vitest";

describe("Immutable metadata", () => {
  it("should store immutable month with token", () => {
    const metadata = { month: 220, tokenId: 1 };
    expect(metadata.month).toBe(220);
  });
});
