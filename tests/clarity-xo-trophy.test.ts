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
