import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "../config";
import { EMPTY } from "./constants";
import { cvToHex, cvToJSON, deserializeCV, principalCV, uintCV } from "@stacks/transactions";

// ── Constants ──────────────────────────────────────────────────────────────
const BLOCKS_PER_MONTH = 4320; // ~1 block per 10 min → ~4320 per month

// ── Stacks helpers ────────────────────────────────────────────────────────
export async function callReadOnly(fnName, args = []) {
  const url = `https://api.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${fnName}`;
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
  return cvToHex(cv);
}

function decodeClarityValue(value) {
  if (typeof value === "string" && value.startsWith("0x")) {
    return cvToJSON(deserializeCV(value));
  }

  return value;
}

function findFirstUint(value) {
  if (!value || typeof value !== "object") return 0;

  if (value.type === "uint" && value.value != null) {
    return Number(value.value);
  }

  if (Array.isArray(value.value)) {
    for (const item of value.value) {
      const nested = findFirstUint(item);
      if (nested) return nested;
    }
  }

  if (value.value && typeof value.value === "object") {
    for (const nestedValue of Object.values(value.value)) {
      const nested = findFirstUint(nestedValue);
      if (nested) return nested;
    }
  }

  return 0;
}

export function parseGameStateFromClarityValue(cv) {
  const decoded = decodeClarityValue(cv?.result);
  const tuple = decoded?.success ? decoded.value : decoded;
  const fields = tuple?.value || tuple || {};

  return {
    board: Array.isArray(fields.board?.value)
      ? fields.board.value.map((cell) => Number(cell.value))
      : Array(9).fill(EMPTY),
    status: Number(fields.status?.value || 0),
    moves: Number(fields.moves?.value || 0),
    month: Number(fields.month?.value || 0),
    player: fields.player?.value || null,
  };
}

// ── Helper to get current month (blocks / BLOCKS_PER_MONTH)
export async function getCurrentMonth() {
  try {
    const res = await fetch(
      `https://api.hiro.so/v2/info`
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
  const decoded = decodeClarityValue(cv?.result);
  const tuple = decoded?.success ? decoded.value : decoded;
  const board = tuple?.value?.board?.value || tuple?.board?.value;

  if (!Array.isArray(board)) return Array(9).fill(EMPTY);

  return board.map((cell) => Number(cell.value || 0));
}

export function parseUintResult(cv) {
  const decoded = decodeClarityValue(cv?.result);
  return findFirstUint(decoded?.success ? decoded.value : decoded);
}
