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
