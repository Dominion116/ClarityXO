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
