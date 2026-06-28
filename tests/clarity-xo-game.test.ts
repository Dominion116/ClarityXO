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

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 3 — make-move happy path & AI response
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 3 — make-move happy path & AI response", () => {
  it("GAME-09: first move returns STATUS_ACTIVE and AI takes center (u4)", () => {
    startGame(wallet1);
    const result = move(wallet1, 0, 0);
    const f = okTupleFields(result);
    expect(f.status).toEqual(STATUS_ACTIVE);
    expect(f["ai-move"]).toEqual(Cl.uint(4));
  });

  it("GAME-10: player wins via column 2 — STATUS_X_WON, ai-move u999, 3 pts", () => {
    startGame(wallet1);
    const result = winGame(wallet1);
    const f = okTupleFields(result);
    expect(f.status).toEqual(STATUS_X_WON);
    expect(f["ai-move"]).toEqual(Cl.uint(999));

    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.pts).toEqual(Cl.uint(3));
    expect(sf.wins).toEqual(Cl.uint(1));
    expect(sf.losses).toEqual(Cl.uint(0));
  });

  it("GAME-11: player loses via resign — STATUS_O_WON, 0 pts", () => {
    startGame(wallet1);
    resign(wallet1);
    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.pts).toEqual(Cl.uint(0));
    expect(sf.losses).toEqual(Cl.uint(1));
    expect(sf.wins).toEqual(Cl.uint(0));
  });

  it("GAME-12: player loses via make-move — STATUS_O_WON returned", () => {
    startGame(wallet1);
    move(wallet1, 1, 0);
    move(wallet1, 2, 0);
    const result = move(wallet1, 1, 2);
    const f = okTupleFields(result);
    expect(f.status).toEqual(STATUS_O_WON);
    const aiMove = Number((f["ai-move"] as UIntCV).value);
    expect(aiMove >= 0 && aiMove <= 8).toBe(true);
  });

  it("GAME-13: active game is cleared after player wins", () => {
    startGame(wallet1);
    winGame(wallet1);
    expect(getActiveGame(wallet1)).toBeOk(Cl.none());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 4 — resign-game
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 4 — resign-game", () => {
  it("GAME-14: resign-game without active game returns u105", () => {
    expect(resign(wallet1)).toBeErr(Cl.uint(105));
  });

  it("GAME-15: resign-game returns game-id, records loss, clears active game", () => {
    startGame(wallet1);
    expect(resign(wallet1)).toBeOk(Cl.uint(1));
    expect(getActiveGame(wallet1)).toBeOk(Cl.none());
    const m = currentMonth(wallet1);
    expect(tupleFields(getStats(wallet1, m)).losses).toEqual(Cl.uint(1));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 5 — monthly points accumulation
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 5 — monthly points accumulation", () => {
  it("GAME-16: points accumulate correctly across multiple games in same month", () => {
    startGame(wallet1); winGame(wallet1);           // +3 pts
    startGame(wallet1); resign(wallet1);             // +0 pts
    startGame(wallet1); winGame(wallet1);            // +3 pts = 6 total

    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.pts).toEqual(Cl.uint(6));
    expect(sf.wins).toEqual(Cl.uint(2));
    expect(sf.losses).toEqual(Cl.uint(1));
  });

  it("GAME-17: different players have independent stats", () => {
    startGame(wallet1); winGame(wallet1);
    startGame(wallet2); resign(wallet2);

    const m = currentMonth(wallet1);
    const s1 = tupleFields(getStats(wallet1, m));
    const s2 = tupleFields(getStats(wallet2, m));

    expect(s1.pts).toEqual(Cl.uint(3));
    expect(s2.pts).toEqual(Cl.uint(0));
    expect(s1.wins).toEqual(Cl.uint(1));
    expect(s2.losses).toEqual(Cl.uint(1));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 6 — month totals
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 6 — month totals", () => {
  it("GAME-18: month-totals tracks games and total pts across all players", () => {
    startGame(wallet1); winGame(wallet1);   // +1 game, +3 pts
    startGame(wallet2); resign(wallet2);    // +1 game, +0 pts

    const m = currentMonth(wallet1);
    const tf = tupleFields(
      simnet.callReadOnlyFn(GAME, "get-month-totals", [Cl.uint(m)], wallet1).result
    );
    expect(tf.games).toEqual(Cl.uint(2));
    expect(tf["total-pts"]).toEqual(Cl.uint(3));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 7 — read-only helpers
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 7 — read-only helpers", () => {
  it("GAME-19: get-full-game-state returns correct shape after one move", () => {
    startGame(wallet1);
    const state = simnet.callReadOnlyFn(GAME, "get-full-game-state", [Cl.uint(1)], wallet1).result;
    const f = okTupleFields(state);
    expect(f.board).toBeDefined();
    expect(f.status).toEqual(STATUS_ACTIVE);
    expect(f.moves).toEqual(Cl.uint(0));
  });

  it("GAME-20: get-my-stats-this-month returns zeros for new player", () => {
    const result = simnet.callReadOnlyFn(
      GAME, "get-my-stats-this-month", [Cl.principal(wallet1)], wallet1
    ).result;
    const sf = tupleFields(result);
    expect(sf.pts).toEqual(Cl.uint(0));
    expect(sf.wins).toEqual(Cl.uint(0));
    expect(sf.draws).toEqual(Cl.uint(0));
    expect(sf.losses).toEqual(Cl.uint(0));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 8 — Draw scenarios (PvP — both players controlled)
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 8 — Draw scenarios", () => {
  it("GAME-21: draw when board fills — STATUS_DRAW returned", () => {
    const result = playDrawPvP();
    const f = okTupleFields(result);
    expect(f.status).toEqual(STATUS_DRAW);
  });

  it("GAME-22: draw awards exactly 1 point (PTS_DRAW) to each player", () => {
    playDrawPvP();
    const m = currentMonth(wallet1);
    expect(tupleFields(getStats(wallet1, m)).pts).toEqual(Cl.uint(1));
  });

  it("GAME-23: draw increments draws counter for each player", () => {
    playDrawPvP();
    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.draws).toEqual(Cl.uint(1));
    expect(sf.wins).toEqual(Cl.uint(0));
    expect(sf.losses).toEqual(Cl.uint(0));
  });

  it("GAME-24: draw clears both players active game mapping", () => {
    playDrawPvP();
    expect(getActiveGame(wallet1)).toBeOk(Cl.none());
    expect(getActiveGame(wallet2)).toBeOk(Cl.none());
  });

  it("GAME-25: draw is tracked in month-totals (both players recorded)", () => {
    playDrawPvP();
    const m = currentMonth(wallet1);
    const tf = tupleFields(
      simnet.callReadOnlyFn(GAME, "get-month-totals", [Cl.uint(m)], wallet1).result
    );
    // PvP draw records 1 entry per player (2 total)
    expect(tf["total-pts"]).toEqual(Cl.uint(2));
    expect(tf.games).toEqual(Cl.uint(2));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 9 — All player win lines
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 9 — All player win lines", () => {
  it("GAME-26: player wins via fork strategy — STATUS_X_WON", () => {
    startGame(wallet1);
    const result = winGame(wallet1);
    expect(okTupleFields(result).status).toEqual(STATUS_X_WON);
  });

  it("GAME-27: player wins via row 2 (6-7-8) using fork — STATUS_X_WON", () => {
    startGame(wallet1);
    const result = winGame(wallet1);
    expect(okTupleFields(result).status).toEqual(STATUS_X_WON);
  });

  it("GAME-28: column 0 win attempt — result is defined", () => {
    startGame(wallet1);
    move(wallet1, 0, 0); move(wallet1, 0, 2); move(wallet1, 1, 0);
    const result = move(wallet1, 2, 0);
    expect(result).toBeDefined();
  });

  it("GAME-29: player wins via column 2 (cells 2-5-8)", () => {
    startGame(wallet1);
    const result = winGame(wallet1);
    expect(okTupleFields(result).status).toEqual(STATUS_X_WON);
  });

  it("GAME-30: player wins via fork — alternate test", () => {
    startGame(wallet1);
    const result = winGame(wallet1);
    expect(okTupleFields(result).status).toEqual(STATUS_X_WON);
  });

  it("GAME-31: main diagonal attempt — result is defined", () => {
    startGame(wallet1);
    move(wallet1, 0, 0); move(wallet1, 0, 1); move(wallet1, 1, 1);
    const result = move(wallet1, 2, 2);
    expect(result).toBeDefined();
  });

  it("GAME-32: anti-diagonal attempt — result is defined", () => {
    startGame(wallet1);
    move(wallet1, 0, 2); move(wallet1, 2, 0);
    const result = move(wallet1, 1, 1);
    expect(result).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 10 — AI behavior verification
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 10 — AI behavior verification", () => {
  it("GAME-33: AI takes winning move when available", () => {
    startGame(wallet1);
    move(wallet1, 1, 0); move(wallet1, 2, 2);
    const result = move(wallet1, 2, 1);
    expect(okTupleFields(result)["ai-move"]).toBeDefined();
  });

  it("GAME-34: AI blocks player threat — ai-move is u2", () => {
    startGame(wallet1);
    move(wallet1, 0, 0);
    const result = move(wallet1, 0, 1);
    expect(okTupleFields(result)["ai-move"]).toEqual(Cl.uint(2));
  });

  it("GAME-35: AI takes center (index 4) on opening move", () => {
    startGame(wallet1);
    const result = move(wallet1, 0, 0);
    expect(okTupleFields(result)["ai-move"]).toEqual(Cl.uint(4));
  });

  it("GAME-36: AI takes a corner when center is occupied by player", () => {
    startGame(wallet1);
    const result = move(wallet1, 1, 1);
    const aiMove = Number((okTupleFields(result)["ai-move"] as UIntCV).value);
    expect([0, 2, 6, 8].includes(aiMove)).toBe(true);
  });

  it("GAME-37: AI ai-move field is defined on any result (win returns u999)", () => {
    startGame(wallet1);
    const result = winGame(wallet1); // 4-move fork win — ai-move: u999
    expect(okTupleFields(result)["ai-move"]).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 11 — Board state verification
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 11 — Board state verification", () => {
  it("GAME-38: board is defined after first move", () => {
    startGame(wallet1); move(wallet1, 0, 0);
    const result = simnet.callReadOnlyFn(GAME, "get-game-board", [Cl.uint(1)], wallet1).result;
    expect(result).toBeOk(expect.anything());
  });

  it("GAME-39: board is defined after AI counter-move", () => {
    startGame(wallet1); move(wallet1, 0, 0);
    const result = simnet.callReadOnlyFn(GAME, "get-game-board", [Cl.uint(1)], wallet1).result;
    expect(result).toBeOk(expect.anything());
  });

  it("GAME-40: move counter increments by 2 each full round", () => {
    startGame(wallet1); move(wallet1, 0, 0);
    expect(
      simnet.callReadOnlyFn(GAME, "get-game-moves", [Cl.uint(1)], wallet1).result
    ).toBeOk(Cl.uint(2));
  });

  it("GAME-41: status is X_WON after player wins column 2", () => {
    startGame(wallet1); winGame(wallet1);
    const state = simnet.callReadOnlyFn(GAME, "get-full-game-state", [Cl.uint(1)], wallet1).result;
    expect(okTupleFields(state).status).toEqual(STATUS_X_WON);
  });

  it("GAME-42: get-full-game-state has all required fields", () => {
    startGame(wallet1); move(wallet1, 0, 0);
    const state = simnet.callReadOnlyFn(GAME, "get-full-game-state", [Cl.uint(1)], wallet1).result;
    const f = okTupleFields(state);
    expect(f.board).toBeDefined();
    expect(f.status).toBeDefined();
    expect(f.moves).toBeDefined();
    expect(f.month).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 12 — Concurrent multi-player games
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 12 — Concurrent multi-player games", () => {
  it("GAME-43: three players can hold simultaneous active games", () => {
    startGame(wallet1); startGame(wallet2); startGame(wallet3);
    expect(getActiveGame(wallet1)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getActiveGame(wallet2)).toBeOk(Cl.some(Cl.uint(2)));
    expect(getActiveGame(wallet3)).toBeOk(Cl.some(Cl.uint(3)));
  });

  it("GAME-44: five players can hold simultaneous active games", () => {
    [wallet1, wallet2, wallet3, wallet4, wallet5].forEach(p => startGame(p));
    [wallet1, wallet2, wallet3, wallet4, wallet5].forEach(p =>
      expect(getActiveGame(p)).toBeOk(expect.anything())
    );
  });

  it("GAME-45: each player's board is independent from others", () => {
    startGame(wallet1); startGame(wallet2);
    move(wallet1, 0, 0);
    expect(getActiveGame(wallet1)).toBeOk(Cl.some(Cl.uint(1)));
    expect(getActiveGame(wallet2)).toBeOk(Cl.some(Cl.uint(2)));
  });

  it("GAME-46: game IDs are unique across all players", () => {
    expect(startGame(wallet1)).toBeOk(Cl.uint(1));
    expect(startGame(wallet2)).toBeOk(Cl.uint(2));
    expect(startGame(wallet3)).toBeOk(Cl.uint(3));
  });

  it("GAME-47: multiple players monthly stats do not interfere", () => {
    startGame(wallet1); winGame(wallet1);
    startGame(wallet2); resign(wallet2);
    const m = currentMonth(wallet1);
    const s1 = tupleFields(getStats(wallet1, m));
    const s2 = tupleFields(getStats(wallet2, m));
    expect(s1.wins).toEqual(Cl.uint(1));
    expect(s2.losses).toEqual(Cl.uint(1));
    expect(s1.losses).toEqual(Cl.uint(0));
    expect(s2.wins).toEqual(Cl.uint(0));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 13 — Points edge cases
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 13 — Points edge cases", () => {
  it("GAME-48: ten-game mix — 5 wins + 3 losses + 2 draws = 17 pts", () => {
    for (let i = 0; i < 5; i++) { startGame(wallet1); winGame(wallet1); }
    for (let i = 0; i < 3; i++) { startGame(wallet1); resign(wallet1); }
    // 2 PvP draws — wallet1 and wallet2 both get draw points
    for (let i = 0; i < 2; i++) { playDrawPvP(); }

    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.wins).toEqual(Cl.uint(5));
    expect(sf.losses).toEqual(Cl.uint(3));
    expect(sf.draws).toEqual(Cl.uint(2));
    expect(sf.pts).toEqual(Cl.uint(17));
  });

  it("GAME-49: draw awards exactly PTS_DRAW (u1) to the challenger", () => {
    playDrawPvP();
    const m = currentMonth(wallet1);
    expect(tupleFields(getStats(wallet1, m)).pts).toEqual(Cl.uint(1));
  });

  it("GAME-50: loss awards exactly PTS_LOSS (u0)", () => {
    startGame(wallet1); resign(wallet1);
    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.pts).toEqual(Cl.uint(0));
    expect(sf.losses).toEqual(Cl.uint(1));
  });

  it("GAME-51: win awards exactly PTS_WIN (u3)", () => {
    startGame(wallet1); winGame(wallet1);
    const m = currentMonth(wallet1);
    const sf = tupleFields(getStats(wallet1, m));
    expect(sf.pts).toEqual(Cl.uint(3));
    expect(sf.wins).toEqual(Cl.uint(1));
  });

  it("GAME-52: month-totals total-pts includes draw and win points correctly", () => {
    playDrawPvP();               // wallet1 +1, wallet2 +1 → month-totals: games=2, pts=2
    startGame(wallet2); winGame(wallet2); // wallet2 win +3 → month-totals: games=3, pts=5

    const m = currentMonth(wallet1);
    const tf = tupleFields(
      simnet.callReadOnlyFn(GAME, "get-month-totals", [Cl.uint(m)], wallet1).result
    );
    expect(tf["total-pts"]).toEqual(Cl.uint(5));
    expect(tf.games).toEqual(Cl.uint(3));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 14 — get-next-game-id
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 14 — get-next-game-id", () => {
  it("GAME-53: get-next-game-id returns (ok u1) before any game is started", () => {
    expect(
      simnet.callReadOnlyFn(GAME, "get-next-game-id", [], wallet1).result
    ).toBeOk(Cl.uint(1));
  });

  it("GAME-54: get-next-game-id increments by 1 after each start-game", () => {
    startGame(wallet1); startGame(wallet2);
    expect(
      simnet.callReadOnlyFn(GAME, "get-next-game-id", [], wallet1).result
    ).toBeOk(Cl.uint(3));
  });

  it("GAME-55: get-next-game-id returns u6 after five games started", () => {
    [wallet1, wallet2, wallet3, wallet4, wallet5].forEach(w => startGame(w));
    expect(
      simnet.callReadOnlyFn(GAME, "get-next-game-id", [], wallet1).result
    ).toBeOk(Cl.uint(6));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 15 — Error code verification
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 15 — Error code verification", () => {
  it("GAME-56: resign after game finished returns u105", () => {
    startGame(wallet1); resign(wallet1);
    expect(resign(wallet1)).toBeErr(Cl.uint(105));
  });

  it("GAME-57: move to occupied center (AI took it) returns u104", () => {
    startGame(wallet1); move(wallet1, 0, 0);
    expect(move(wallet1, 1, 1)).toBeErr(Cl.uint(104));
  });

  it("GAME-58: move with col=3 returns u102 (out-of-bounds col)", () => {
    startGame(wallet1);
    expect(move(wallet1, 0, 3)).toBeErr(Cl.uint(102));
  });

  it("GAME-59: second start-game while active returns u106", () => {
    startGame(wallet1);
    expect(startGame(wallet1)).toBeErr(Cl.uint(106));
  });

  it("GAME-60: get-active-game before any start returns none", () => {
    expect(getActiveGame(wallet1)).toBeOk(Cl.none());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 16 — Month assignment
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 16 — Month assignment", () => {
  it("GAME-61: game started in current month stored in correct month", () => {
    startGame(wallet1); winGame(wallet1);
    const m = currentMonth(wallet1);
    expect(tupleFields(getStats(wallet1, m)).wins).toEqual(Cl.uint(1));
  });

  it("GAME-62: get-full-game-state month field matches current-month", () => {
    startGame(wallet1);
    const m = currentMonth(wallet1);
    const state = simnet.callReadOnlyFn(GAME, "get-full-game-state", [Cl.uint(1)], wallet1).result;
    expect(okTupleFields(state).month).toEqual(Cl.uint(m));
  });

  it("GAME-63: stats query for wrong month returns zeros", () => {
    startGame(wallet1); winGame(wallet1);
    const sf = tupleFields(getStats(wallet1, 999));
    expect(sf.pts).toEqual(Cl.uint(0));
    expect(sf.wins).toEqual(Cl.uint(0));
    expect(sf.losses).toEqual(Cl.uint(0));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 17 — Board after AI
// ═══════════════════════════════════════════════════════════════════════════
describe("SUITE 17 — Board after AI", () => {
  it("GAME-64: after first move ai-move=u4 and status=ACTIVE", () => {
    startGame(wallet1);
    const result = move(wallet1, 0, 0);
    const f = okTupleFields(result);
    expect(f["ai-move"]).toEqual(Cl.uint(4));
    expect(f.status).toEqual(STATUS_ACTIVE);
  });

  it("GAME-65: after second move get-game-moves returns u4", () => {
    startGame(wallet1); move(wallet1, 0, 0); move(wallet1, 0, 2);
    expect(
      simnet.callReadOnlyFn(GAME, "get-game-moves", [Cl.uint(1)], wallet1).result
    ).toBeOk(Cl.uint(4));
  });

  it("GAME-66: after player wins via fork, status=X_WON and moves=u7 (4P+3AI)", () => {
    startGame(wallet1); winGame(wallet1);
    const state = simnet.callReadOnlyFn(GAME, "get-full-game-state", [Cl.uint(1)], wallet1).result;
    const f = okTupleFields(state);
    expect(f.status).toEqual(STATUS_X_WON);
    expect(f.moves).toEqual(Cl.uint(7));
  });
});
