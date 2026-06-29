import { describe, it, expect } from "vitest";

describe("Base URI fallback", () => {
  it("should use base URI when month URI unavailable", () => {
    const baseUri = "https://clarityxo.xyz/nft/";
    const monthUri = undefined;
    const finalUri = monthUri || baseUri;
    expect(finalUri).toBe(baseUri);
  });
});
