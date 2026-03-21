import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

// ─── helpers ────────────────────────────────────────────────────────────────

const TROPHY = "clarity-xo-trophy";

// Clarinet's simnet starts at burn-block-height = 0.
// current-month = burn-block-height / 4320 = 0.
// For month 0 to be "over" we need current-month > 0,
// i.e. burn-block-height >= 4320.
// We mine extra blocks to advance the month counter.
const BLOCKS_PER_MONTH = 4320;

function advanceMonth(chain: Chain, by = 1) {
  // mine enough blocks to move to the next month
  chain.mineEmptyBlockUntil(chain.blockHeight + BLOCKS_PER_MONTH * by);
}

function setWinners(
  chain: Chain,
  owner: Account,
  month: number,
  winners: Account[]
) {
  return chain.mineBlock([
    Tx.contractCall(
      TROPHY,
      "set-month-winners",
      [
        types.uint(month),
        types.list(winners.map((w) => types.principal(w.address))),
      ],
      owner.address
    ),
  ]);
}

function claim(chain: Chain, caller: Account, month: number) {
  return chain.mineBlock([
    Tx.contractCall(
      TROPHY,
      "claim-trophy",
      [types.uint(month)],
      caller.address
    ),
  ]);
}

function hasClaimed(chain: Chain, month: number, player: Account) {
  return chain.callReadOnlyFn(
    TROPHY,
    "has-claimed",
    [types.uint(month), types.principal(player.address)],
    player.address
  );
}

function getRank(chain: Chain, month: number, player: Account) {
  return chain.callReadOnlyFn(
    TROPHY,
    "get-player-rank",
    [types.uint(month), types.principal(player.address)],
    player.address
  );
}

function getOwner(chain: Chain, tokenId: number, caller: Account) {
  return chain.callReadOnlyFn(
    TROPHY,
    "get-owner",
    [types.uint(tokenId)],
    caller.address
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 1 — set-month-winners (owner admin)
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "TROPHY-01: non-owner cannot set-month-winners (u100)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const nonOwner = accounts.get("wallet_1")!;
    const p2       = accounts.get("wallet_2")!;

    advanceMonth(chain);  // move to month 1 so month 0 is "over"

    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY,
        "set-month-winners",
        [types.uint(0), types.list([types.principal(p2.address)])],
        nonOwner.address
      ),
    ]);
    b.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "TROPHY-02: owner cannot set winners for the current (non-over) month (u103)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1       = accounts.get("wallet_1")!;

    // current-month is 0, we try to set winners for month 0 — not over yet
    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY,
        "set-month-winners",
        [types.uint(0), types.list([types.principal(p1.address)])],
        deployer.address
      ),
    ]);
    b.receipts[0].result.expectErr().expectUint(103);
  },
});

Clarinet.test({
  name: "TROPHY-03: owner sets winners for a past month successfully",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);  // now current-month = 1, month 0 is over

    const b = setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);
    b.receipts[0].result.expectOk().expectBool(true);

    const winners = chain.callReadOnlyFn(
      TROPHY, "get-month-winners", [types.uint(0)], deployer.address
    );
    winners.result.expectOk().expectSome();
  },
});

Clarinet.test({
  name: "TROPHY-04: get-player-rank returns correct 1-based rank",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    getRank(chain, 0, p1).result.expectOk().expectSome().expectUint(1);
    getRank(chain, 0, p2).result.expectOk().expectSome().expectUint(2);
    getRank(chain, 0, p5).result.expectOk().expectSome().expectUint(5);
  },
});

Clarinet.test({
  name: "TROPHY-05: get-player-rank returns none for non-whitelisted player",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer  = accounts.get("deployer")!;
    const p1        = accounts.get("wallet_1")!;
    const outsider  = accounts.get("wallet_6")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p1, p1, p1, p1]); // only p1

    getRank(chain, 0, outsider).result.expectOk().expectNone();
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 2 — claim-trophy
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "TROPHY-06: whitelisted player can claim trophy after month ends",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1       = accounts.get("wallet_1")!;
    const p2       = accounts.get("wallet_2")!;
    const p3       = accounts.get("wallet_3")!;
    const p4       = accounts.get("wallet_4")!;
    const p5       = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    const b = claim(chain, p1, 0);
    b.receipts[0].result.expectOk().expectBool(true);

    // token 1 should belong to p1
    getOwner(chain, 1, p1).result
      .expectOk()
      .expectSome()
      .expectPrincipal(p1.address);
  },
});

Clarinet.test({
  name: "TROPHY-07: STX fee is transferred from claimer to owner on claim",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1       = accounts.get("wallet_1")!;
    const p2       = accounts.get("wallet_2")!;
    const p3       = accounts.get("wallet_3")!;
    const p4       = accounts.get("wallet_4")!;
    const p5       = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    const b = claim(chain, p1, 0);
    b.receipts[0].result.expectOk();

    // Check STX event — fee is 500_000 uSTX
    const stxEvent = b.receipts[0].events.find(
      (e: any) => e.type === "stx_transfer_event"
    );
    assertEquals(stxEvent !== undefined, true);
    assertEquals(stxEvent.stx_transfer_event.amount, "500000");
    assertEquals(stxEvent.stx_transfer_event.sender,    p1.address);
    assertEquals(stxEvent.stx_transfer_event.recipient, deployer.address);
  },
});

Clarinet.test({
  name: "TROPHY-08: non-whitelisted player cannot claim (u101)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer  = accounts.get("deployer")!;
    const p1        = accounts.get("wallet_1")!;
    const outsider  = accounts.get("wallet_6")!;
    const p2        = accounts.get("wallet_2")!;
    const p3        = accounts.get("wallet_3")!;
    const p4        = accounts.get("wallet_4")!;
    const p5        = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    const b = claim(chain, outsider, 0);
    b.receipts[0].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "TROPHY-09: double claim by same player returns u102",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    claim(chain, p1, 0);                    // first claim — ok
    const b2 = claim(chain, p1, 0);         // second — rejected
    b2.receipts[0].result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "TROPHY-10: claiming before month is over returns u103",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    // current-month is 0, month 0 is NOT yet over
    const b = claim(chain, p1, 0);
    b.receipts[0].result.expectErr().expectUint(103);
  },
});

Clarinet.test({
  name: "TROPHY-11: all 5 winners can each claim their own trophy",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const players  = [
      accounts.get("wallet_1")!,
      accounts.get("wallet_2")!,
      accounts.get("wallet_3")!,
      accounts.get("wallet_4")!,
      accounts.get("wallet_5")!,
    ];

    advanceMonth(chain);
    setWinners(chain, deployer, 0, players);

    players.forEach((p, i) => {
      const b = claim(chain, p, 0);
      b.receipts[0].result.expectOk().expectBool(true);
    });

    // Total supply should be 5
    chain.callReadOnlyFn(TROPHY, "get-last-token-id", [], deployer.address)
      .result.expectOk().expectUint(5);
  },
});

Clarinet.test({
  name: "TROPHY-12: has-claimed reflects correct state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);

    // Before claim
    hasClaimed(chain, 0, p1).result.expectOk().expectBool(false);

    claim(chain, p1, 0);

    // After claim
    hasClaimed(chain, 0, p1).result.expectOk().expectBool(true);
    // p2 still not claimed
    hasClaimed(chain, 0, p2).result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "TROPHY-13: get-trophy-meta stores correct month, rank and player",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);
    claim(chain, p1, 0);   // token 1, rank 1

    const meta = chain.callReadOnlyFn(
      TROPHY, "get-trophy-meta", [types.uint(1)], p1.address
    ).result.expectOk().expectSome().expectTuple();

    assertEquals(meta["month"], types.uint(0));
    assertEquals(meta["rank"],  types.uint(1));
    assertEquals(meta["player"], p1.address);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 3 — admin functions
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "TROPHY-14: owner can update mint fee",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY, "set-mint-fee", [types.uint(1000000)], deployer.address
      ),
    ]);
    b.receipts[0].result.expectOk().expectUint(1000000);

    chain.callReadOnlyFn(TROPHY, "get-mint-fee", [], deployer.address)
      .result.expectOk().expectUint(1000000);
  },
});

Clarinet.test({
  name: "TROPHY-15: non-owner cannot update mint fee (u100)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const nonOwner = accounts.get("wallet_1")!;
    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY, "set-mint-fee", [types.uint(0)], nonOwner.address
      ),
    ]);
    b.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "TROPHY-16: owner can update base-uri",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const newUri   = "https://myipfs.io/nft/";

    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY,
        "set-base-uri",
        [types.stringAscii(newUri)],
        deployer.address
      ),
    ]);
    b.receipts[0].result.expectOk().expectAscii(newUri);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 4 — SIP-009 transfer
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "TROPHY-17: token owner can transfer to another principal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;
    const p6 = accounts.get("wallet_6")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);
    claim(chain, p1, 0);  // p1 owns token 1

    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY,
        "transfer",
        [types.uint(1), types.principal(p1.address), types.principal(p6.address)],
        p1.address
      ),
    ]);
    b.receipts[0].result.expectOk().expectBool(true);

    getOwner(chain, 1, p6).result
      .expectOk()
      .expectSome()
      .expectPrincipal(p6.address);
  },
});

Clarinet.test({
  name: "TROPHY-18: non-owner cannot transfer a token (u106)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;
    const thief = accounts.get("wallet_6")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);
    claim(chain, p1, 0);  // p1 owns token 1

    const b = chain.mineBlock([
      Tx.contractCall(
        TROPHY,
        "transfer",
        [types.uint(1), types.principal(p1.address), types.principal(thief.address)],
        thief.address  // thief trying to transfer
      ),
    ]);
    b.receipts[0].result.expectErr().expectUint(106);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUITE 5 — multi-month scenario
// ═══════════════════════════════════════════════════════════════════════════

Clarinet.test({
  name: "TROPHY-19: winners from month 0 and month 1 are tracked independently",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const players0 = [
      accounts.get("wallet_1")!,
      accounts.get("wallet_2")!,
      accounts.get("wallet_3")!,
      accounts.get("wallet_4")!,
      accounts.get("wallet_5")!,
    ];
    const players1 = [
      accounts.get("wallet_6")!,
      accounts.get("wallet_7")!,
      accounts.get("wallet_8")!,
      accounts.get("wallet_9")!,
      accounts.get("wallet_10")!,
    ];

    advanceMonth(chain);
    setWinners(chain, deployer, 0, players0);
    advanceMonth(chain);
    setWinners(chain, deployer, 1, players1);

    getRank(chain, 0, players0[0]).result.expectOk().expectSome().expectUint(1);
    getRank(chain, 1, players1[0]).result.expectOk().expectSome().expectUint(1);
    getRank(chain, 1, players0[0]).result.expectOk().expectNone();
  },
});

Clarinet.test({
  name: "TROPHY-20: get-token-uri returns base-uri concatenated with token id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const p4 = accounts.get("wallet_4")!;
    const p5 = accounts.get("wallet_5")!;

    advanceMonth(chain);
    setWinners(chain, deployer, 0, [p1, p2, p3, p4, p5]);
    claim(chain, p1, 0);

    const uri = chain.callReadOnlyFn(
      TROPHY, "get-token-uri", [types.uint(1)], p1.address
    ).result.expectOk().expectSome();

    assertEquals(uri, "https://clarityxo.xyz/nft/1");
  },
});
