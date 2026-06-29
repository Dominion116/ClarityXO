#!/usr/bin/env node

/**
 * Deploy ClarityXO Trophy v3 and setup May (month 220)
 *
 * Usage:
 *   node deploy-trophy-v3-may.js
 *
 * Prerequisites:
 *   - npm packages installed (@stacks/transactions, @stacks/network)
 *   - settings/Mainnet.toml has valid deployer mnemonic
 *   - Network set to mainnet
 */

const {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  listCV,
  uintCV,
  stringAsciiCV,
} = require("@stacks/transactions");

const { StacksMainnet } = require("@stacks/network");
const fs = require("fs");
const path = require("path");

const NETWORK = new StacksMainnet();
const DEPLOYER_MNEMONIC =
  "add aunt series position trade endless general now end budget cute saddle venue upset welcome crucial castle strike gold icon gentle grunt palm avocado";

const DEPLOYER_ADDRESS = "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y";
const CONTRACT_NAME = "clarityxotrophyv3";
const MONTH = 220;
const MINT_FEE = 20000; // 0.02 STX in micro-STX
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

async function deploy() {
  console.log("🚀 ClarityXO Trophy v3 — May Deployment\n");

  // Step 1: Deploy the contract
  console.log(
    "📦 Step 1/4: Deploying clarityxotrophyv3 to mainnet...\n"
  );

  const contractPath = path.join(__dirname, "contracts", "clarityxotrophyv3.clar");
  const contractCode = fs.readFileSync(contractPath, "utf8");

  const deployTx = await makeContractDeploy({
    contract: {
      name: CONTRACT_NAME,
      code: contractCode,
    },
    senderKey: DEPLOYER_MNEMONIC,
    network: NETWORK,
    anchorMode: "onChainOnly",
    fee: 205000, // Adjust based on contract size
  });

  console.log(`   TX ID: ${deployTx.txid()}`);
  console.log("   Broadcasting...\n");
  await broadcastTransaction(deployTx, NETWORK);
  console.log("   ✓ Deployment broadcasted. Waiting 60 seconds for confirmation...\n");
  await delay(60000);

  // Step 2: Set month URI
  console.log(
    "📸 Step 2/4: Setting May image URI...\n"
  );

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

  console.log(`   TX ID: ${setUriTx.txid()}`);
  console.log("   Broadcasting...\n");
  await broadcastTransaction(setUriTx, NETWORK);
  console.log("   ✓ Month URI set. Waiting 30 seconds...\n");
  await delay(30000);

  // Step 3: Set mint fee
  console.log(
    "💰 Step 3/4: Setting mint fee to 0.02 STX...\n"
  );

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

  console.log(`   TX ID: ${setFeeTx.txid()}`);
  console.log("   Broadcasting...\n");
  await broadcastTransaction(setFeeTx, NETWORK);
  console.log("   ✓ Mint fee set. Waiting 30 seconds...\n");
  await delay(30000);

  // Step 4: Set month winners
  console.log(
    "🏆 Step 4/4: Setting May's top 5 winners...\n"
  );

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

  console.log(`   TX ID: ${setWinnersTx.txid()}`);
  console.log("   Broadcasting...\n");
  await broadcastTransaction(setWinnersTx, NETWORK);
  console.log("   ✓ Winners set.\n");

  // Summary
  console.log("=====================================");
  console.log("✅ May Trophy Setup Complete!");
  console.log("=====================================\n");
  console.log("Contract:  SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y.clarityxotrophyv3");
  console.log("Month:     220 (May 2026)");
  console.log("Mint Fee:  0.02 STX");
  console.log("Image URI: https://scarlet-large-hummingbird-596.mypinata.cloud/ipfs/bafybeib6x6w7u4emwb4k7ky757xhw4u367ttykskchj6q522ttd2jh4fgm/");
  console.log("\nTop 5 Winners:");
  MAY_TOP_5.forEach((addr, i) => {
    console.log(`  ${i + 1}. ${addr}`);
  });
  console.log("\n🎁 Winners can now claim their trophies by calling:");
  console.log("   (contract-call? .clarityxotrophyv3 claim-trophy u220)");
  console.log("\n📖 Or via web3 wallet: https://explorer.stacks.co/");
}

deploy().catch((err) => {
  console.error("❌ Deployment failed:", err.message);
  process.exit(1);
});
