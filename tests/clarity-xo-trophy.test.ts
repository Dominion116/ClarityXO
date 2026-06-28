import { describe, it, expect } from "vitest";
import { Cl, ClarityValue, ResponseOkCV, TupleCV, SomeCV, StringAsciiCV } from "@stacks/transactions";

const TROPHY = "clarityxotrophyv2";
const BLOCKS_PER_MONTH = 4320;

// simnet is reset automatically before each test (initBeforeEach: true)

const accounts  = simnet.getAccounts();
const deployer  = accounts.get("deployer")!;
const wallet1   = accounts.get("wallet_1")!;
const wallet2   = accounts.get("wallet_2")!;
const wallet3   = accounts.get("wallet_3")!;
const wallet4   = accounts.get("wallet_4")!;
const wallet5   = accounts.get("wallet_5")!;
const wallet6   = accounts.get("wallet_6")!;
const wallet7   = accounts.get("wallet_7")!;
const wallet8   = accounts.get("wallet_8")!;
const wallet9   = accounts.get("wallet_9")!;
const wallet10  = accounts.get("wallet_10")!;

// ─── helpers ─────────────────────────────────────────────────────────────────

function advanceMonth(by = 1) {
  simnet.mineEmptyBlocks(BLOCKS_PER_MONTH * by);
}

function setWinners(month: number, winners: string[]) {
  return simnet.callPublicFn(
    TROPHY, "set-month-winners",
    [Cl.uint(month), Cl.list(winners.map(w => Cl.principal(w)))],
    deployer
  ).result;
}

function claim(player: string, month: number) {
  return simnet.callPublicFn(TROPHY, "claim-trophy", [Cl.uint(month)], player);
}

function hasClaimed(month: number, player: string) {
  return simnet.callReadOnlyFn(
    TROPHY, "has-claimed",
    [Cl.uint(month), Cl.principal(player)],
    player
  ).result;
}

function getRank(month: number, player: string) {
  return simnet.callReadOnlyFn(
    TROPHY, "get-player-rank",
    [Cl.uint(month), Cl.principal(player)],
    player
  ).result;
}

function getOwner(tokenId: number) {
  return simnet.callReadOnlyFn(TROPHY, "get-owner", [Cl.uint(tokenId)], deployer).result;
}

// Extract fields from (ok (some tuple)) — get-trophy-meta returns this shape
function metaFields(result: ClarityValue): Record<string, ClarityValue> {
  const okVal = (result as ResponseOkCV).value as SomeCV;
  return (okVal.value as TupleCV).data;
}

const TOP5 = [wallet1, wallet2, wallet3, wallet4, wallet5];

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 1 — set-month-winners (owner admin)
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 1 — set-month-winners", () => {
  it("TROPHY-01: non-owner cannot set-month-winners (u100)", () => {
    advanceMonth();
    expect(
      simnet.callPublicFn(
        TROPHY, "set-month-winners",
        [Cl.uint(0), Cl.list(TOP5.map(w => Cl.principal(w)))],
        wallet1
      ).result
    ).toBeErr(Cl.uint(100));
  });

  it("TROPHY-02: owner cannot set winners for the current (non-over) month (u103)", () => {
    expect(setWinners(0, TOP5)).toBeErr(Cl.uint(103));
  });

  it("TROPHY-03: owner sets winners for a past month successfully", () => {
    advanceMonth();
    expect(setWinners(0, TOP5)).toBeOk(Cl.bool(true));
    expect(
      simnet.callReadOnlyFn(TROPHY, "get-month-winners", [Cl.uint(0)], deployer).result
    ).toBeOk(Cl.some(Cl.list(TOP5.map(w => Cl.principal(w)))));
  });

  it("TROPHY-04: get-player-rank returns correct 1-based rank", () => {
    advanceMonth();
    setWinners(0, TOP5);
    expect(getRank(0, wallet1)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getRank(0, wallet2)).toBeOk(Cl.some(Cl.uint(2)));
    expect(getRank(0, wallet5)).toBeOk(Cl.some(Cl.uint(5)));
  });

  it("TROPHY-05: get-player-rank returns none for non-whitelisted player", () => {
    advanceMonth();
    setWinners(0, [wallet1, wallet1, wallet1, wallet1, wallet1]);
    expect(getRank(0, wallet6)).toBeOk(Cl.none());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 2 — claim-trophy
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 2 — claim-trophy", () => {
  it("TROPHY-06: whitelisted player can claim trophy after month ends", () => {
    advanceMonth();
    setWinners(0, TOP5);
    expect(claim(wallet1, 0).result).toBeOk(Cl.bool(true));
    expect(getOwner(1)).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it("TROPHY-07: STX fee is transferred from claimer to owner on claim", () => {
    advanceMonth();
    setWinners(0, TOP5);
    const { result, events } = claim(wallet1, 0);
    expect(result).toBeOk(Cl.bool(true));
    const stxEvent = events.find(e => e.event === "stx_transfer_event");
    expect(stxEvent).toBeDefined();
    expect(stxEvent!.data.amount).toBe("500000");
    expect(stxEvent!.data.sender).toBe(wallet1);
    expect(stxEvent!.data.recipient).toBe(deployer);
  });

  it("TROPHY-08: non-whitelisted player cannot claim (u101)", () => {
    advanceMonth();
    setWinners(0, TOP5);
    expect(claim(wallet6, 0).result).toBeErr(Cl.uint(101));
  });

  it("TROPHY-09: double claim by same player returns u102", () => {
    advanceMonth();
    setWinners(0, TOP5);
    claim(wallet1, 0);
    expect(claim(wallet1, 0).result).toBeErr(Cl.uint(102));
  });

  it("TROPHY-10: claiming before month is over returns u103", () => {
    expect(claim(wallet1, 0).result).toBeErr(Cl.uint(103));
  });

  it("TROPHY-11: all 5 winners can each claim their own trophy", () => {
    advanceMonth();
    setWinners(0, TOP5);
    TOP5.forEach(p => expect(claim(p, 0).result).toBeOk(Cl.bool(true)));
    expect(
      simnet.callReadOnlyFn(TROPHY, "get-last-token-id", [], deployer).result
    ).toBeOk(Cl.uint(5));
  });

  it("TROPHY-12: has-claimed reflects correct state", () => {
    advanceMonth();
    setWinners(0, TOP5);
    expect(hasClaimed(0, wallet1)).toBeOk(Cl.bool(false));
    claim(wallet1, 0);
    expect(hasClaimed(0, wallet1)).toBeOk(Cl.bool(true));
    expect(hasClaimed(0, wallet2)).toBeOk(Cl.bool(false));
  });

  it("TROPHY-13: get-trophy-meta stores correct month, rank and player", () => {
    advanceMonth();
    setWinners(0, TOP5);
    claim(wallet1, 0);
    const result = simnet.callReadOnlyFn(TROPHY, "get-trophy-meta", [Cl.uint(1)], wallet1).result;
    const f = metaFields(result);
    expect(f.month).toEqual(Cl.uint(0));
    expect(f.rank).toEqual(Cl.uint(1));
    expect(f.player).toEqual(Cl.principal(wallet1));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 3 — admin functions
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 3 — admin functions", () => {
  it("TROPHY-14: owner can update mint fee", () => {
    expect(
      simnet.callPublicFn(TROPHY, "set-mint-fee", [Cl.uint(1_000_000)], deployer).result
    ).toBeOk(Cl.uint(1_000_000));
    expect(
      simnet.callReadOnlyFn(TROPHY, "get-mint-fee", [], deployer).result
    ).toBeOk(Cl.uint(1_000_000));
  });

  it("TROPHY-15: non-owner cannot update mint fee (u100)", () => {
    expect(
      simnet.callPublicFn(TROPHY, "set-mint-fee", [Cl.uint(0)], wallet1).result
    ).toBeErr(Cl.uint(100));
  });

  it("TROPHY-16: owner can update base-uri", () => {
    const newUri = "https://myipfs.io/nft/";
    expect(
      simnet.callPublicFn(TROPHY, "set-base-uri", [Cl.stringAscii(newUri)], deployer).result
    ).toBeOk(Cl.stringAscii(newUri));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 4 — SIP-009 transfer
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 4 — SIP-009 transfer", () => {
  it("TROPHY-17: token owner can transfer to another principal", () => {
    advanceMonth();
    setWinners(0, TOP5);
    claim(wallet1, 0);
    expect(
      simnet.callPublicFn(
        TROPHY, "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet6)],
        wallet1
      ).result
    ).toBeOk(Cl.bool(true));
    expect(getOwner(1)).toBeOk(Cl.some(Cl.principal(wallet6)));
  });

  it("TROPHY-18: non-owner cannot transfer a token (u106)", () => {
    advanceMonth();
    setWinners(0, TOP5);
    claim(wallet1, 0);
    expect(
      simnet.callPublicFn(
        TROPHY, "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet6)],
        wallet6
      ).result
    ).toBeErr(Cl.uint(106));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 5 — multi-month scenario
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 5 — multi-month scenario", () => {
  it("TROPHY-19: winners from month 0 and month 1 are tracked independently", () => {
    const m0 = [wallet1, wallet2, wallet3, wallet4, wallet5];
    const m1 = [wallet6, wallet7, wallet8, wallet9, wallet10];
    advanceMonth();
    setWinners(0, m0);
    advanceMonth();
    setWinners(1, m1);
    expect(getRank(0, wallet1)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getRank(1, wallet6)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getRank(1, wallet1)).toBeOk(Cl.none());
  });

  it("TROPHY-20: get-token-uri returns base-uri concatenated with token id", () => {
    advanceMonth();
    setWinners(0, TOP5);
    claim(wallet1, 0);
    expect(
      simnet.callReadOnlyFn(TROPHY, "get-token-uri", [Cl.uint(1)], wallet1).result
    ).toBeOk(Cl.some(Cl.stringAscii("https://clarityxo.xyz/nft/1")));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 6 — set-month-winners edge cases
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 6 — set-month-winners edge cases", () => {
  it("TROPHY-21: owner can overwrite winners for same past month", () => {
    advanceMonth();
    setWinners(0, TOP5);
    expect(setWinners(0, [wallet6, wallet2, wallet3, wallet4, wallet5])).toBeOk(Cl.bool(true));
    expect(getRank(0, wallet6)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getRank(0, wallet1)).toBeOk(Cl.none());
  });

  it("TROPHY-22: single winner list (same address five times) works correctly", () => {
    advanceMonth();
    expect(setWinners(0, [wallet1, wallet1, wallet1, wallet1, wallet1])).toBeOk(Cl.bool(true));
    expect(getRank(0, wallet1)).toBeOk(Cl.some(Cl.uint(1)));
  });

  it("TROPHY-23: same principal appears twice — get-player-rank finds first occurrence", () => {
    advanceMonth();
    setWinners(0, [wallet1, wallet2, wallet1, wallet3, wallet3]);
    expect(getRank(0, wallet1)).toBeOk(Cl.some(Cl.uint(1)));
  });

  it("TROPHY-24: cannot set winners for a month that is still current (u103)", () => {
    expect(setWinners(0, [wallet1, wallet1, wallet1, wallet1, wallet1])).toBeErr(Cl.uint(103));
  });

  it("TROPHY-25: set-month-winners for month 2 after three advances works", () => {
    advanceMonth(3);
    expect(setWinners(2, TOP5)).toBeOk(Cl.bool(true));
    expect(getRank(2, wallet1)).toBeOk(Cl.some(Cl.uint(1)));
  });
});
