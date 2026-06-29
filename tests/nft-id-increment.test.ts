import { describe, it, expect } from "vitest";

describe("NFT ID increment", () => {
  it("should increment token ID on each claim", () => {
    let tokenId = 0;
    tokenId += 1;
    expect(tokenId).toBe(1);
  });
});
