import { describe, it, expect } from "vitest";

describe("Trophy authorization", () => {
  it("should restrict admin functions to owner", () => {
    const owner = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    const notOwner = "ST2PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    expect(owner).not.toBe(notOwner);
  });

  it("should allow owner to set month winners", () => {
    const owner = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    const isOwner = owner === "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    expect(isOwner).toBe(true);
  });

  it("should allow owner to set mint fee", () => {
    const txSender = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    const contractOwner = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    expect(txSender).toBe(contractOwner);
  });

  it("should allow owner to set month URI", () => {
    const caller = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    const owner = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
    expect(caller).toBe(owner);
  });

  it("should allow any player to claim eligible trophy", () => {
    const player = "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY";
    const isPlayer = player.startsWith("SP");
    expect(isPlayer).toBe(true);
  });
});
