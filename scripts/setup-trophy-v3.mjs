/**
 * setup-trophy-v3.mjs
 * Post-deploy admin calls on clarityxotrophyv3:
 *   1. set-month-uri    — point month 220 (May 2026) at its image folder
 *   2. set-mint-fee     — set the STX fee winners pay you per claim
 *   3. set-month-winners — whitelist the top-5 May players
 *
 * Edit the three CONFIG sections below before running.
 *
 * Usage (after clarityxotrophyv3 is confirmed on-chain):
 *   node scripts/setup-trophy-v3.mjs
 */

import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion,
  Cl,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

// ─── CONFIG — edit these before running ──────────────────────────────────────

// May 2026 = month 220.  URI should end with "/" so token 4 → base + "4"
const MAY_MONTH   = 220n;
const MAY_URI     = "https://clarityxo.xyz/nft/may2026/";   // ← your image folder

// STX fee in micro-STX that each winner pays you when claiming.
// 1_000_000 = 1 STX  |  2_000_000 = 2 STX  |  5_000_000 = 5 STX
const MINT_FEE    = 1_000_000n;                               // ← adjust as desired

// Top-5 May players in rank order (rank 1 first).
const MAY_WINNERS = [
  "SP...",   // rank 1
  "SP...",   // rank 2
  "SP...",   // rank 3
  "SP...",   // rank 4
  "SP...",   // rank 5
];

// ─────────────────────────────────────────────────────────────────────────────

const MNEMONIC =
  "add aunt series position trade endless general now end budget cute saddle venue upset welcome crucial castle strike gold icon gentle grunt palm avocado";

const DEPLOYER   = "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y";
const CONTRACT   = "clarityxotrophyv3";
const network    = new StacksMainnet();

// Validate winners list
if (MAY_WINNERS.some(w => w.startsWith("SP..."))) {
  console.error("✗ Replace the placeholder SP... addresses in MAY_WINNERS before running.");
  process.exit(1);
}

// Derive private key
const seed    = mnemonicToSeedSync(MNEMONIC);
const privKey = Buffer.from(
  HDKey.fromMasterSeed(seed).derive("m/44'/5757'/0'/0/0").privateKey
).toString("hex") + "01";

if (getAddressFromPrivateKey(privKey, TransactionVersion.Mainnet) !== DEPLOYER) {
  console.error("✗ Key derivation mismatch — aborting.");
  process.exit(1);
}

// Fetch starting nonce
const res   = await fetch(`https://api.hiro.so/v2/accounts/${DEPLOYER}?proof=0`);
const data  = await res.json();
let nonce   = BigInt(data.nonce);
console.log("Starting nonce:", nonce.toString(), "\n");

// Helper — build, broadcast, and wait a beat between txs
async function call(fn, args, label) {
  console.log(`Sending: ${label} …`);
  const tx = await makeContractCall({
    contractAddress: DEPLOYER,
    contractName: CONTRACT,
    functionName: fn,
    functionArgs: args,
    senderKey: privKey,
    network,
    nonce: nonce++,
    fee: 10_000n,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
  const r = await broadcastTransaction({ transaction: tx, network });
  if (r.error) {
    console.error(`  ✗ ${label} failed:`, r.error, r.reason ?? "");
    return null;
  }
  console.log(`  ✓ ${label}`);
  console.log(`    txid: ${r.txid}`);
  console.log(`    track: https://explorer.hiro.so/txid/${r.txid}?chain=mainnet\n`);
  return r.txid;
}

// 1 — set-month-uri for May
await call(
  "set-month-uri",
  [Cl.uint(MAY_MONTH), Cl.stringAscii(MAY_URI)],
  `set-month-uri(${MAY_MONTH}, "${MAY_URI}")`
);

// 2 — set-mint-fee
await call(
  "set-mint-fee",
  [Cl.uint(MINT_FEE)],
  `set-mint-fee(${MINT_FEE} uSTX = ${Number(MINT_FEE) / 1_000_000} STX)`
);

// 3 — set-month-winners for May
await call(
  "set-month-winners",
  [Cl.uint(MAY_MONTH), Cl.list(MAY_WINNERS.map(w => Cl.principal(w)))],
  `set-month-winners(${MAY_MONTH}, [${MAY_WINNERS.join(", ")}])`
);

console.log("All setup transactions broadcast.");
console.log("Once they confirm, tell your top-5 to call claim-trophy(u220) on:");
console.log(`https://explorer.hiro.so/txid/${DEPLOYER}.${CONTRACT}?chain=mainnet`);
