import { describe, it, expect } from "vitest";
import { Cl, ClarityValue, ResponseOkCV, TupleCV, UIntCV } from "@stacks/transactions";

const GAME = "clarity-xo-game-v2";

const STATUS_ACTIVE = Cl.uint(0);
const STATUS_X_WON  = Cl.uint(1);
const STATUS_O_WON  = Cl.uint(2);
const STATUS_DRAW   = Cl.uint(3);

// simnet is reset automatically before each test (initBeforeEach: true)

const accounts = simnet.getAccounts();
const wallet1   = accounts.get("wallet_1")!;
const wallet2   = accounts.get("wallet_2")!;
const wallet3   = accounts.get("wallet_3")!;
const wallet4   = accounts.get("wallet_4")!;
const wallet5   = accounts.get("wallet_5")!;

// ─── helpers ─────────────────────────────────────────────────────────────────

function startGame(player: string) {
  return simnet.callPublicFn(GAME, "start-game", [], player).result;
}

function move(player: string, row: number, col: number) {
  return simnet.callPublicFn(GAME, "make-move", [Cl.uint(row), Cl.uint(col)], player).result;
}

function resign(player: string) {
  return simnet.callPublicFn(GAME, "resign-game", [], player).result;
}

function getActiveGame(player: string) {
  return simnet.callReadOnlyFn(GAME, "get-active-game", [Cl.principal(player)], player).result;
}

function getStats(player: string, month: number) {
  return simnet.callReadOnlyFn(
    GAME, "get-monthly-stats",
    [Cl.uint(month), Cl.principal(player)],
    player
  ).result;
}

function currentMonth(caller: string): number {
  const r = simnet.callReadOnlyFn(GAME, "current-month", [], caller).result;
  return Number((r as UIntCV).value);
}

function tupleFields(result: ClarityValue): Record<string, ClarityValue> {
  return (result as TupleCV).data;
}

function okTupleFields(result: ClarityValue): Record<string, ClarityValue> {
  return ((result as ResponseOkCV).value as TupleCV).data;
}

// 4-move fork win (verified against AI):
// X: (0,0)→(2,2)→(2,0)→(2,1) creates two simultaneous threats
//   Turn 1: X at corner (0) → AI at center (4)
//   Turn 2: X at corner (8) → AI at first empty corner (2)
//   Turn 3: X at corner (6) → AI blocks col-0 threat at (3)
//   Turn 4: X at (7) → row 2 (6,7,8) complete → WIN
function winGame(player: string) {
  move(player, 0, 0); // AI → center (4)
  move(player, 2, 2); // AI → corner (2)
  move(player, 2, 0); // AI → blocks col-0 at (3)
  return move(player, 2, 1); // row 2 complete → STATUS_X_WON, ai-move u999
}

// PvP draw: verified sequence produces a draw board (X O X / O O X / X O X)
// X: (0,0),(0,1),(1,2),(2,0),(2,2)  O: (0,2),(1,0),(1,1),(2,1)
function playDrawPvP() {
  createChallenge(wallet1, wallet2);
  acceptChallenge(wallet2, wallet1);
  pvpMove(wallet1, 0, 0); pvpMove(wallet2, 0, 2);
  pvpMove(wallet1, 0, 1); pvpMove(wallet2, 1, 0);
  pvpMove(wallet1, 1, 2); pvpMove(wallet2, 1, 1);
  pvpMove(wallet1, 2, 0); pvpMove(wallet2, 2, 1);
  return pvpMove(wallet1, 2, 2); // fills the board → draw
}

// PvP helpers
function createChallenge(challenger: string, opponent: string) {
  return simnet.callPublicFn(GAME, "create-challenge", [Cl.principal(opponent)], challenger).result;
}

function acceptChallenge(accepter: string, challenger: string) {
  return simnet.callPublicFn(GAME, "accept-challenge", [Cl.principal(challenger)], accepter).result;
}

function declineChallenge(decliner: string, challenger: string) {
  return simnet.callPublicFn(GAME, "decline-challenge", [Cl.principal(challenger)], decliner).result;
}

function cancelChallenge(challenger: string) {
  return simnet.callPublicFn(GAME, "cancel-challenge", [], challenger).result;
}

function pvpMove(player: string, row: number, col: number) {
  return simnet.callPublicFn(GAME, "make-pvp-move", [Cl.uint(row), Cl.uint(col)], player).result;
}

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 1 — start-game
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 1 — start-game", () => {
  it("GAME-01: start-game creates a new game and returns game-id u1", () => {
    expect(startGame(wallet1)).toBeOk(Cl.uint(1));
    expect(getActiveGame(wallet1)).toBeOk(Cl.some(Cl.uint(1)));
  });

  it("GAME-02: start-game increments game-id for each new player", () => {
    startGame(wallet1);
    expect(startGame(wallet2)).toBeOk(Cl.uint(2));
  });

  it("GAME-03: start-game fails if player already has an active game (u106)", () => {
    startGame(wallet1);
    expect(startGame(wallet1)).toBeErr(Cl.uint(106));
  });

  it("GAME-04: player can start a new game after finishing previous one", () => {
    startGame(wallet1);
    resign(wallet1);
    expect(startGame(wallet1)).toBeOk(Cl.uint(2));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 2 — make-move guards
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 2 — make-move guards", () => {
  it("GAME-05: make-move without active game returns u105", () => {
    expect(move(wallet1, 0, 0)).toBeErr(Cl.uint(105));
  });

  it("GAME-06: make-move with out-of-bounds row returns u102", () => {
    startGame(wallet1);
    expect(move(wallet1, 3, 0)).toBeErr(Cl.uint(102));
  });

  it("GAME-07: playing the same cell twice returns u104", () => {
    startGame(wallet1);
    move(wallet1, 0, 0);
    expect(move(wallet1, 0, 0)).toBeErr(Cl.uint(104));
  });

  it("GAME-08: make-move after game finished returns u105", () => {
    startGame(wallet1);
    resign(wallet1);
    expect(move(wallet1, 0, 0)).toBeErr(Cl.uint(105));
  });
});
