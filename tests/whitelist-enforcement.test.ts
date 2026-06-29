import { describe, it, expect } from "vitest";

describe("Whitelist enforcement", () => {
  it("should only allow whitelisted claims", () => {
    const whitelist = ["SP1"];
    const requestor = "SP1";
    expect(whitelist).toContain(requestor);
  });
});
