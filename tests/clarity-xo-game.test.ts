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
