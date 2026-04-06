import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "../config";
import { EMPTY } from "./constants";
import { uintCV, principalCV, serializeCV } from "@stacks/transactions";

// ── Constants ──────────────────────────────────────────────────────────────
const BLOCKS_PER_MONTH = 4320; // ~1 block per 10 min → ~4320 per month

// ── Stacks helpers ────────────────────────────────────────────────────────
export async function callReadOnly(fnName, args = []) {
  const url = `https://stacks-node-api.${NETWORK}.stacks.co/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${fnName}`;
  const body = { sender: CONTRACT_ADDRESS, arguments: args };
  const res  = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  return json;
}

// ── Helper to encode CV arguments to hex format ─────────────────────────────
export function encodeCVArg(cv) {
  return "0x" + serializeCV(cv).toString("hex");
}

// ── Helper to get current month (blocks / BLOCKS_PER_MONTH)
export async function getCurrentMonth() {
  try {
    const res = await fetch(
      `https://stacks-node-api.${NETWORK}.stacks.co/v2/info`
    );
    const data = await res.json();
    const burnHeight = data.burn_block_height || 0;
    return Math.floor(burnHeight / BLOCKS_PER_MONTH);
  } catch (e) {
    console.error("Error fetching current month:", e);
    return 0;
  }
}

export function parseBoardFromClarityValue(cv) {
  // cv.result is a Clarity serialised "(ok (list u0 u1 ...))"
  // We do a quick string parse – good enough for uint lists
  const match = cv.result?.match(/\(list\s+([\d\s u]+)\)/);
  if (!match) return Array(9).fill(EMPTY);
  return match[1]
    .trim()
    .split(/\s+/)
    .map(s => parseInt(s.replace("u",""), 10));
}

export function parseUintResult(cv) {
  const match = cv.result?.match(/u(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
