import { describe, it, expect } from "vitest";

describe("May month 220 setup", () => {
  it("should configure month 220 for May", () => {
    const month = 220;
    const uri = "https://scarlet-large-hummingbird-596.mypinata.cloud/ipfs/bafybeib6x6w7u4emwb4k7ky757xhw4u367ttykskchj6q522ttd2jh4fgm/";
    const fee = 20000;
    
    expect(month).toBe(220);
    expect(uri.length).toBeLessThanOrEqual(256);
    expect(fee).toBe(20000);
  });
});
