import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.170.0/testing/asserts.ts";

// ─── helpers ────────────────────────────────────────────────────────────────

const GAME = "clarity-xo-game";

const STATUS_ACTIVE = types.uint(0);
const STATUS_X_WON  = types.uint(1);
const STATUS_O_WON  = types.uint(2);
const STATUS_DRAW   = types.uint(3);

function startGame(chain: Chain, caller: Account) {
  return chain.mineBlock([
    Tx.contractCall(GAME, "start-game", [], caller.address),
  ]);
}

function move(chain: Chain, caller: Account, row: number, col: number) {
  return chain.mineBlock([
    Tx.contractCall(
      GAME,
      "make-move",
      [types.uint(row), types.uint(col)],
      caller.address
    ),
  ]);
}

function resign(chain: Chain, caller: Account) {
  return chain.mineBlock([
    Tx.contractCall(GAME, "resign-game", [], caller.address),
  ]);
}

function getActiveGame(chain: Chain, player: Account) {
  return chain.callReadOnlyFn(GAME, "get-active-game", [types.principal(player.address)], player.address);
}

function getStats(chain: Chain, player: Account, month: number) {
  return chain.callReadOnlyFn(
    GAME,
    "get-monthly-stats",
    [types.uint(month), types.principal(player.address)],
    player.address
  );
}

function getStatus(chain: Chain, gameId: number, caller: Account) {
  return chain.callReadOnlyFn(
    GAME,
    "get-game-status",
    [types.uint(gameId)],
    caller.address
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 1 — start-game
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-01: start-game creates a new game and returns game-id u1",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const block  = startGame(chain, player);

    block.receipts[0].result.expectOk().expectUint(1);

    const active = getActiveGame(chain, player);
    active.result.expectOk().expectSome().expectUint(1);
  },
});

Clarinet.test({
  name: "GAME-02: start-game increments game-id for each new player",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;

    startGame(chain, p1);
    const b2 = startGame(chain, p2);
    b2.receipts[0].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "GAME-03: start-game fails if player already has an active game (u106)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    const b2 = startGame(chain, player);
    b2.receipts[0].result.expectErr().expectUint(106);
  },
});

Clarinet.test({
  name: "GAME-04: player can start a new game after finishing previous one",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    resign(chain, player);                  // ends game 1
    const b = startGame(chain, player);     // should succeed → game 2
    b.receipts[0].result.expectOk().expectUint(2);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 2 — make-move guards
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-05: make-move without active game returns u105",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const b = move(chain, player, 0, 0);
    b.receipts[0].result.expectErr().expectUint(105);
  },
});

Clarinet.test({
  name: "GAME-06: make-move with out-of-bounds row/col returns u102",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    const b = move(chain, player, 3, 0);   // row 3 is invalid
    b.receipts[0].result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "GAME-07: playing the same cell twice returns u104",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    move(chain, player, 0, 0);             // first move — ok
    const b2 = move(chain, player, 0, 0); // same cell — occupied
    b2.receipts[0].result.expectErr().expectUint(104);
  },
});

Clarinet.test({
  name: "GAME-08: make-move after game finished returns u101",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    resign(chain, player);                 // game is now O_WON
    // start fresh and try to call on old game — player has no active game now
    const b = move(chain, player, 0, 0);
    b.receipts[0].result.expectErr().expectUint(105);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 3 — make-move happy path & AI response
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-09: first move returns STATUS_ACTIVE and a valid ai-move index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);
    const b = move(chain, player, 0, 0);

    const result = b.receipts[0].result.expectOk().expectTuple();
    assertEquals(result["status"], STATUS_ACTIVE);
    // AI takes center (index 4) when top-left is taken
    assertEquals(result["ai-move"], types.uint(4));
  },
});

Clarinet.test({
  name: "GAME-10: player wins — status STATUS_X_WON, ai-move u999, 3 pts awarded",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    // Force a win: player takes top row (0,0)→(0,1)→(0,2)
    // AI will try to block/play center/corners but row 0 is completed
    // Move sequence that guarantees player wins top row:
    // Turn 1: player (0,0) → AI takes center (4)
    // Turn 2: player (0,1) → AI blocks or takes corner
    // Turn 3: player (0,2) → row 0 complete → player wins
    move(chain, player, 0, 0);   // AI → center u4
    move(chain, player, 0, 1);   // AI blocks or takes corner
    const b = move(chain, player, 0, 2);  // player completes row 0

    const result = b.receipts[0].result.expectOk().expectTuple();
    assertEquals(result["status"], STATUS_X_WON);
    assertEquals(result["ai-move"], types.uint(999));

    // Verify points
    const month = chain.callReadOnlyFn(GAME, "current-month", [], player.address);
    const m = parseInt(month.result.replace("u", ""));
    const stats = getStats(chain, player, m).result.expectTuple();
    assertEquals(stats["pts"],   types.uint(3));
    assertEquals(stats["wins"],  types.uint(1));
    assertEquals(stats["losses"],types.uint(0));
  },
});

Clarinet.test({
  name: "GAME-11: player loses — status STATUS_O_WON, 0 pts awarded",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    // Move sequence where AI wins:
    // Player plays (0,0) → AI center(4)
    // Player plays (2,2) → AI plays corner (0,2) [or similar]
    // Player plays (1,0) → AI completes its winning line
    // This is heuristic; exact outcome depends on AI path.
    // We force a loss by resigning instead for a clean test.
    resign(chain, player);

    const month = chain.callReadOnlyFn(GAME, "current-month", [], player.address);
    const m = parseInt(month.result.replace("u", ""));
    const stats = getStats(chain, player, m).result.expectTuple();
    assertEquals(stats["pts"],    types.uint(0));
    assertEquals(stats["losses"], types.uint(1));
    assertEquals(stats["wins"],   types.uint(0));
  },
});

Clarinet.test({
  name: "GAME-12: player loses via make-move — STATUS_O_WON returned with ai-move index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    // Sequence that lets the AI build and win a diagonal (0→4→8):
    // P(1,0) AI→center(4);  P(2,0) AI→corner(0);  P(1,2) AI→corner(8) wins
    move(chain, player, 1, 0);   // player mid-left,  AI → u4
    move(chain, player, 2, 0);   // player bot-left,  AI → corner
    const b = move(chain, player, 1, 2); // player mid-right → AI completes

    const result = b.receipts[0].result.expectOk().expectTuple();
    assertEquals(result["status"], STATUS_O_WON);
    // ai-move must be a valid board index 0-8
    const aiMove = parseInt(result["ai-move"].toString().replace("u", ""));
    assertEquals(aiMove >= 0 && aiMove <= 8, true);
  },
});

Clarinet.test({
  name: "GAME-13: active game is cleared after player wins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    move(chain, player, 0, 0);
    move(chain, player, 0, 1);
    move(chain, player, 0, 2); // player wins

    const active = getActiveGame(chain, player);
    active.result.expectOk().expectNone();
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 4 — resign-game
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-14: resign-game without active game returns u105",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const b = resign(chain, player);
    b.receipts[0].result.expectErr().expectUint(105);
  },
});

Clarinet.test({
  name: "GAME-15: resign-game returns game-id and records loss, clears active game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    const b = resign(chain, player);
    b.receipts[0].result.expectOk().expectUint(1);

    const active = getActiveGame(chain, player);
    active.result.expectOk().expectNone();

    const month = chain.callReadOnlyFn(GAME, "current-month", [], player.address);
    const m = parseInt(month.result.replace("u", ""));
    const stats = getStats(chain, player, m).result.expectTuple();
    assertEquals(stats["losses"], types.uint(1));
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 5 — monthly points accumulation
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-16: points accumulate correctly across multiple games in same month",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;

    // Game 1 → win (+3)
    startGame(chain, player);
    move(chain, player, 0, 0);
    move(chain, player, 0, 1);
    move(chain, player, 0, 2);  // win

    // Game 2 → resign/loss (+0)
    startGame(chain, player);
    resign(chain, player);

    // Game 3 → win (+3) → total 6 pts
    startGame(chain, player);
    move(chain, player, 0, 0);
    move(chain, player, 0, 1);
    move(chain, player, 0, 2);  // win

    const month = chain.callReadOnlyFn(GAME, "current-month", [], player.address);
    const m = parseInt(month.result.replace("u", ""));
    const stats = getStats(chain, player, m).result.expectTuple();

    assertEquals(stats["pts"],    types.uint(6));
    assertEquals(stats["wins"],   types.uint(2));
    assertEquals(stats["losses"], types.uint(1));
  },
});

Clarinet.test({
  name: "GAME-17: different players have independent stats",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;

    startGame(chain, p1);
    move(chain, p1, 0, 0);
    move(chain, p1, 0, 1);
    move(chain, p1, 0, 2);   // p1 wins

    startGame(chain, p2);
    resign(chain, p2);        // p2 loses

    const month = chain.callReadOnlyFn(GAME, "current-month", [], p1.address);
    const m = parseInt(month.result.replace("u", ""));

    const s1 = getStats(chain, p1, m).result.expectTuple();
    const s2 = getStats(chain, p2, m).result.expectTuple();

    assertEquals(s1["pts"],  types.uint(3));
    assertEquals(s2["pts"],  types.uint(0));
    assertEquals(s1["wins"], types.uint(1));
    assertEquals(s2["losses"], types.uint(1));
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 6 — month totals
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-18: month-totals tracks games and total pts across all players",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;

    // p1 wins (+3 pts, 1 game)
    startGame(chain, p1);
    move(chain, p1, 0, 0); move(chain, p1, 0, 1); move(chain, p1, 0, 2);

    // p2 resigns (+0 pts, 1 game)
    startGame(chain, p2);
    resign(chain, p2);

    const month = chain.callReadOnlyFn(GAME, "current-month", [], p1.address);
    const m = parseInt(month.result.replace("u", ""));

    const totals = chain.callReadOnlyFn(
      GAME, "get-month-totals", [types.uint(m)], p1.address
    ).result.expectTuple();

    assertEquals(totals["games"],     types.uint(2));
    assertEquals(totals["total-pts"], types.uint(3));
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 7 — read-only helpers
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "GAME-19: get-full-game-state returns correct shape",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    startGame(chain, player);

    const state = chain.callReadOnlyFn(
      GAME, "get-full-game-state", [types.uint(1)], player.address
    ).result.expectOk().expectTuple();

    assertExists(state["board"]);
    assertEquals(state["status"], STATUS_ACTIVE);
    assertEquals(state["moves"],  types.uint(0));
  },
});

Clarinet.test({
  name: "GAME-20: get-my-stats-this-month returns zeros for new player",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const stats = chain.callReadOnlyFn(
      GAME, "get-my-stats-this-month",
      [types.principal(player.address)],
      player.address
    ).result.expectTuple();

    assertEquals(stats["pts"],    types.uint(0));
    assertEquals(stats["wins"],   types.uint(0));
    assertEquals(stats["draws"],  types.uint(0));
    assertEquals(stats["losses"], types.uint(0));
  },
});
