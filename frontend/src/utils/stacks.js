import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "../config";
import { EMPTY } from "./constants";

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
