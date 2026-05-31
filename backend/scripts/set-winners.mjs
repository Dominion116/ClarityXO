/**
 * Initialises the ClarityXO trophy contract for month 219 (April / block-month).
 *
 * Sends three sequential transactions as the contract owner:
 *   1. set-base-uri  — points token URIs at the backend metadata endpoint
 *   2. set-mint-fee  — 0.01 STX (10 000 uSTX)
 *   3. set-month-winners — top-5 players for month 219
 *
 * Usage:
 *   OWNER_KEY=<your-hex-private-key> node backend/scripts/set-winners.mjs
 */

import {
  makeContractCall,
  broadcastTransaction,
  getAddressFromPrivateKey,
  AnchorMode,
  PostConditionMode,
  Cl,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

// ── Config ────────────────────────────────────────────────────────────────────

const OWNER_KEY = process.env.OWNER_KEY;
if (!OWNER_KEY) {
  console.error('Error: set OWNER_KEY=<hex-private-key> before running');
  process.exit(1);
}

const TROPHY_ADDRESS = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
const TROPHY_NAME    = 'clarityxotrophyv2';
const MONTH          = 219;
const MINT_FEE_USTX  = 10_000;           // 0.01 STX
const BASE_URI       = 'https://clarityxo.onrender.com/nft/';
const STACKS_API     = 'https://api.mainnet.hiro.so';

// Top-5 for month 219 — sorted by points desc (28, 28, 28, 26, 25).
// Three-way tie at rank 1 is broken by leaderboard insertion order.
const TOP5 = [
  'SPESCH9H4NHZ9YB6FS4BAH0F456MQ6PF9B8176TF',    // 28 pts — rank 1
  'SP3HF104GHP6CBE5SPNHWAMDT0QCEQEN3MZABC3S7',   // 28 pts — rank 2
  'SP4M1E1W3VKAFPARARGYM37VQP0YHD3MAWJZJHAK',    // 28 pts — rank 3
  'SP1ZDHDT2D6EH9CTJZA2FMTV8FJGTBSQBJQ46ABEN',   // 26 pts — rank 4
  'SP2RVJGCGABWB5G0WEPE936G270D1RKF1WV2GD7SM',   // 25 pts — rank 5
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const network      = new StacksMainnet({ url: STACKS_API });
const ownerAddress = getAddressFromPrivateKey(OWNER_KEY);

async function fetchNonce() {
  const res  = await fetch(`${STACKS_API}/v2/accounts/${ownerAddress}?proof=0`);
  const data = await res.json();
  return Number(data.nonce);
}

async function send(label, functionName, functionArgs, nonce) {
  console.log(`\n[${label}] ${functionName}  (nonce ${nonce})`);

  const tx = await makeContractCall({
    contractAddress:   TROPHY_ADDRESS,
    contractName:      TROPHY_NAME,
    functionName,
    functionArgs,
    senderKey:         OWNER_KEY,
    network,
    nonce,
    anchorMode:        AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee:               3000,  // 0.003 STX — enough for simple admin calls
  });

  const result = await broadcastTransaction(tx, network);

  if (result.error) {
    console.error('  FAILED:', result.error, result.reason || '');
    process.exit(1);
  }

  console.log('  txid:', result.txid);
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('ClarityXO Trophy — month 219 initialisation');
  console.log('Owner :', ownerAddress);
  console.log('Contract:', `${TROPHY_ADDRESS}.${TROPHY_NAME}`);

  let nonce = await fetchNonce();
  console.log('Nonce :', nonce);

  // 1. Set base URI so token URIs resolve to the metadata endpoint
  await send('1/3', 'set-base-uri', [Cl.stringAscii(BASE_URI)], nonce++);

  // 2. Set mint fee to 0.01 STX
  await send('2/3', 'set-mint-fee', [Cl.uint(MINT_FEE_USTX)], nonce++);

  // 3. Whitelist the top-5 players for month 219
  console.log('\n[3/3] set-month-winners  month=219  (nonce ' + nonce + ')');
  console.log('  Winners:');
  TOP5.forEach((addr, i) => console.log(`    ${i + 1}. ${addr}`));

  const tx = await makeContractCall({
    contractAddress:   TROPHY_ADDRESS,
    contractName:      TROPHY_NAME,
    functionName:      'set-month-winners',
    functionArgs:      [Cl.uint(MONTH), Cl.list(TOP5.map(Cl.standardPrincipal))],
    senderKey:         OWNER_KEY,
    network,
    nonce,
    anchorMode:        AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee:               3000,
  });

  const result = await broadcastTransaction(tx, network);
  if (result.error) {
    console.error('  FAILED:', result.error, result.reason || '');
    process.exit(1);
  }
  console.log('  txid:', result.txid);

  console.log('\nAll 3 transactions are in the mempool.');
  console.log('Once confirmed, each winner can call claim-trophy(219) and pay 0.01 STX.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
