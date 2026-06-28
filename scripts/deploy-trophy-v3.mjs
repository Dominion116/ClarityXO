/**
 * deploy-trophy-v3.mjs
 * Deploys clarityxotrophyv3.clar to Stacks mainnet.
 *
 * Usage:
 *   node scripts/deploy-trophy-v3.mjs
 *
 * Reads the deployer mnemonic from settings/Mainnet.toml and derives
 * the private key via BIP44 path m/44'/5757'/0'/0/0 (standard Stacks path).
 */

import { readFileSync } from "fs";
import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

// ─── config ──────────────────────────────────────────────────────────────────

const MNEMONIC =
  "add aunt series position trade endless general now end budget cute saddle venue upset welcome crucial castle strike gold icon gentle grunt palm avocado";

const CONTRACT_NAME = "clarityxotrophyv3";
const CONTRACT_PATH = new URL("../contracts/clarityxotrophyv3.clar", import.meta.url);
const EXPECTED_SENDER = "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y";

// ─── derive private key ───────────────────────────────────────────────────────

const seed    = mnemonicToSeedSync(MNEMONIC);
const root    = HDKey.fromMasterSeed(seed);
const child   = root.derive("m/44'/5757'/0'/0/0");
const privKey = Buffer.from(child.privateKey).toString("hex") + "01"; // compressed

const senderAddress = getAddressFromPrivateKey(privKey, TransactionVersion.Mainnet);
console.log("Deployer address :", senderAddress);

if (senderAddress !== EXPECTED_SENDER) {
  console.error("✗ Address mismatch — check mnemonic or derivation path.");
  process.exit(1);
}
console.log("✓ Address verified\n");

// ─── read contract ────────────────────────────────────────────────────────────

const codeBody = readFileSync(CONTRACT_PATH, "utf8");
console.log(`Contract         : ${CONTRACT_NAME}`);
console.log(`Source size      : ${codeBody.length} chars\n`);

// ─── fetch nonce ─────────────────────────────────────────────────────────────

console.log("Fetching nonce from Hiro API …");
let nonce;
try {
  const res  = await fetch(`https://api.hiro.so/v2/accounts/${senderAddress}?proof=0`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  nonce      = BigInt(data.nonce);
  console.log("Nonce            :", nonce.toString(), "\n");
} catch (err) {
  console.error("✗ Failed to fetch nonce:", err.message);
  console.error("  Make sure you have internet access and api.hiro.so is reachable.");
  process.exit(1);
}

// ─── build transaction ────────────────────────────────────────────────────────

const network = new StacksMainnet();

const tx = await makeContractDeploy({
  contractName: CONTRACT_NAME,
  codeBody,
  senderKey: privKey,
  network,
  nonce,
  fee: 200_000n,            // 0.2 STX — safe for a contract of this size
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
});

// ─── broadcast ────────────────────────────────────────────────────────────────

console.log("Broadcasting …");
let result;
try {
  result = await broadcastTransaction({ transaction: tx, network });
} catch (err) {
  console.error("✗ Broadcast error:", err.message);
  process.exit(1);
}

if (result.error) {
  console.error("✗ Rejected by node:", result.error);
  console.error("  Reason          :", result.reason ?? "—");
  if (result.reason_data) console.error("  Detail          :", JSON.stringify(result.reason_data));
  process.exit(1);
}

console.log("\n✓ Transaction broadcast successfully!");
console.log("TX ID  :", result.txid);
console.log("Track  : https://explorer.hiro.so/txid/" + result.txid + "?chain=mainnet");
console.log("\nOnce confirmed (~10 min), run the post-deploy setup:");
console.log("  node scripts/setup-trophy-v3.mjs");
