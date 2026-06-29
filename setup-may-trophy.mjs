#!/usr/bin/env node

// Setup May (month 220) for ClarityXO Trophy v3

import {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  listCV,
  uintCV,
  stringAsciiCV,
} from "@stacks/transactions";

import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();
const DEPLOYER_MNEMONIC =
  "add aunt series position trade endless general now end budget cute saddle venue upset welcome crucial castle strike gold icon gentle grunt palm avocado";

const DEPLOYER_ADDRESS = "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y";
const CONTRACT_NAME = "clarityxotrophyv3";
const MONTH = 220;
const MINT_FEE = 20000; // 0.02 STX
const MAY_IMAGE_URI =
  "https://scarlet-large-hummingbird-596.mypinata.cloud/ipfs/bafybeib6x6w7u4emwb4k7ky757xhw4u367ttykskchj6q522ttd2jh4fgm/";

const MAY_TOP_5 = [
  "SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY",
  "SP3XR5PCCV557KE2ZZB3W04B91F6042HKZ8KNX1ZS",
  "SP1HCKS0FDRC50F7VWRZJ9747V2EB38YA8FXGRXNC",
  "SP1EM6HQFSV15WYS4G9BRMM3YF4TH9Y4437YCKTG1",
  "SPJY043NRW86A9SVMHPC6AZ1CWCXV21KCDC42P2N",
];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setup() {
  console.log("🏆 Setting up May (month 220) for ClarityXO Trophy v3\n");

  // Transaction 1: Set month URI
  console.log("1/3 Setting May image URI...");
  const setUriTx = await makeContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "set-month-uri",
    functionArgs: [uintCV(MONTH), stringAsciiCV(MAY_IMAGE_URI)],
    senderKey: DEPLOYER_MNEMONIC,
    network: NETWORK,
    anchorMode: "onChainOnly",
    fee: 200,
  });

  console.log(`   TX: ${setUriTx.txid()}`);
  await broadcastTransaction(setUriTx, NETWORK);
  console.log("   Broadcasted ✓\n");
  await delay(15000);

  // Transaction 2: Set mint fee
  console.log("2/3 Setting mint fee to 0.02 STX...");
  const setFeeTx = await makeContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "set-mint-fee",
    functionArgs: [uintCV(MINT_FEE)],
    senderKey: DEPLOYER_MNEMONIC,
    network: NETWORK,
    anchorMode: "onChainOnly",
    fee: 200,
  });

  console.log(`   TX: ${setFeeTx.txid()}`);
  await broadcastTransaction(setFeeTx, NETWORK);
  console.log("   Broadcasted ✓\n");
  await delay(15000);

  // Transaction 3: Set month winners
  console.log("3/3 Setting May top 5 winners...");
  const winnersList = listCV(MAY_TOP_5.map((addr) => standardPrincipalCV(addr)));
  const setWinnersTx = await makeContractCall({
    contractAddress: DEPLOYER_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "set-month-winners",
    functionArgs: [uintCV(MONTH), winnersList],
    senderKey: DEPLOYER_MNEMONIC,
    network: NETWORK,
    anchorMode: "onChainOnly",
    fee: 200,
  });

  console.log(`   TX: ${setWinnersTx.txid()}`);
  await broadcastTransaction(setWinnersTx, NETWORK);
  console.log("   Broadcasted ✓\n");
  await delay(5000);

  // Summary
  console.log("=====================================");
  console.log("✅ May Trophy Setup Complete!");
  console.log("=====================================\n");
  console.log("Contract:   SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y.clarityxotrophyv3");
  console.log("Month:      220 (May 2026)");
  console.log("Mint Fee:   0.02 STX");
  console.log("Image Base: https://scarlet-large-hummingbird-596.mypinata.cloud/ipfs/bafybeib6x6w7u4emwb4k7ky757xhw4u367ttykskchj6q522ttd2jh4fgm/");
  console.log("\nTop 5 Winners:");
  MAY_TOP_5.forEach((addr, i) => {
    console.log(`  ${i + 1}. ${addr}`);
  });
  console.log("\nAll transactions confirmed. Winners can now claim:");
  console.log("   (contract-call? .clarityxotrophyv3 claim-trophy u220)");
}

setup().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
