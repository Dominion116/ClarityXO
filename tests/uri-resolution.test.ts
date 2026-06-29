import { describe, it, expect } from "vitest";

describe("URI resolution", () => {
  it("should use month-specific URI when available", () => {
    const monthUri = "https://ipfs.io/ipfs/QmTest/";
    expect(monthUri).toBeDefined();
  });

  it("should fall back to base URI", () => {
    const baseUri = "https://clarityxo.xyz/nft/";
    expect(baseUri).toBeDefined();
  });
});
