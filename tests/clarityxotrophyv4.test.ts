import { describe, it, expect, beforeEach } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";

describe("clarityxotrophyv4", () => {
  let simnet: any;
  const deployer = "ST1PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
  const player1 = "ST2PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";
  const player2 = "ST3PQHQV5W8KCJ5DXQJM4H5P9Q8R2S3T4U5V6W7X8";

  beforeEach(async () => {
    simnet = await initSimnet();
  });

  describe("set-month-uri", () => {
    it("should allow contract owner to set month URI", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-uri",
        ["u220", '"https://test.example.com/"'],
        deployer
      );
      expect(tx.isOk()).toBe(true);
    });

    it("should reject non-owner calls", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-uri",
        ["u220", '"https://test.example.com/"'],
        player1
      );
      expect(tx.isErr()).toBe(true);
    });

    it("should store URI for later retrieval", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-uri",
        ["u220", '"https://test.example.com/"'],
        deployer
      );

      const read = simnet.callReadOnlyFn(
        "clarityxotrophyv4",
        "get-month-uri",
        ["u220"],
        deployer
      );
      expect(read.result).toContain("test.example.com");
    });
  });

  describe("set-mint-fee", () => {
    it("should allow owner to update mint fee", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-mint-fee",
        ["u50000"],
        deployer
      );
      expect(tx.isOk()).toBe(true);
    });

    it("should reject non-owner fee updates", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-mint-fee",
        ["u50000"],
        player1
      );
      expect(tx.isErr()).toBe(true);
    });

    it("should return updated fee on query", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-mint-fee",
        ["u75000"],
        deployer
      );

      const read = simnet.callReadOnlyFn(
        "clarityxotrophyv4",
        "get-mint-fee",
        [],
        deployer
      );
      expect(read.result).toContain("75000");
    });
  });

  describe("set-month-winners", () => {
    it("should allow owner to set top 5 winners", async () => {
      const winners = [player1, player2];
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1} '${player2})`],
        deployer
      );
      expect(tx.isOk()).toBe(true);
    });

    it("should reject non-owner winner updates", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        player1
      );
      expect(tx.isErr()).toBe(true);
    });

    it("should require completed month", async () => {
      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u999999", `(list '${player1})`],
        deployer
      );
      expect(tx.isErr()).toBe(true);
    });
  });

  describe("claim-trophy", () => {
    it("should allow whitelisted player to claim trophy", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-mint-fee",
        ["u1000"],
        deployer
      );

      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );
      expect(tx.isOk()).toBe(true);
    });

    it("should reject non-whitelisted players", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player2
      );
      expect(tx.isErr()).toBe(true);
    });

    it("should prevent duplicate claims", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );

      const secondAttempt = simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );
      expect(secondAttempt.isErr()).toBe(true);
    });
  });

  describe("transfer", () => {
    it("should allow token owner to transfer trophy", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );

      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "transfer",
        ["u1", `'${player1}`, `'${player2}`],
        player1
      );
      expect(tx.isOk()).toBe(true);
    });

    it("should reject unauthorized transfer attempts", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );

      const tx = simnet.callPublicFn(
        "clarityxotrophyv4",
        "transfer",
        ["u1", `'${player1}`, `'${player2}`],
        player2
      );
      expect(tx.isErr()).toBe(true);
    });
  });

  describe("get-token-uri", () => {
    it("should return correct URI for claimed trophy", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-uri",
        ["u220", '"https://ipfs.io/ipfs/QmTest/"'],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );

      const read = simnet.callReadOnlyFn(
        "clarityxotrophyv4",
        "get-token-uri",
        ["u1"],
        deployer
      );
      expect(read.result).toContain("ipfs.io");
    });

    it("should fall back to base URI if month URI not set", async () => {
      simnet.callPublicFn(
        "clarityxotrophyv4",
        "set-month-winners",
        ["u220", `(list '${player1})`],
        deployer
      );

      simnet.callPublicFn(
        "clarityxotrophyv4",
        "claim-trophy",
        ["u220"],
        player1
      );

      const read = simnet.callReadOnlyFn(
        "clarityxotrophyv4",
        "get-token-uri",
        ["u1"],
        deployer
      );
      expect(read.result).toContain("clarityxo.xyz");
    });
  });
});
