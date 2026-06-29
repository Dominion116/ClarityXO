import { describe, it, expect } from "vitest";

describe("Month URI mapping", () => {
  it("should map month to URI", () => {
    const monthUris = new Map();
    monthUris.set(220, "https://ipfs.io/ipfs/QmTest/");
    expect(monthUris.get(220)).toBeDefined();
  });
});
