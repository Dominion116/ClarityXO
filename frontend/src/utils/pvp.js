import { uintCV, principalCV } from '@stacks/transactions';
import { request } from '@stacks/connect';
import { CONFIG } from '../config';
import { encodeCVArg } from './stacks';

function callPvPContract(functionName, functionArgs = []) {
  return request('stx_callContract', {
    contract: `${CONFIG.contractAddress}.${CONFIG.contractName}`,
    functionName,
    functionArgs,
    network: CONFIG.network,
  });
}

export async function createChallenge(opponentAddr) {
  return callPvPContract('create-challenge', [
    encodeCVArg(principalCV(opponentAddr)),
  ]);
}

export async function acceptChallenge(challengerAddr) {
  return callPvPContract('accept-challenge', [
    encodeCVArg(principalCV(challengerAddr)),
  ]);
}

export async function declineChallenge(challengerAddr) {
  return callPvPContract('decline-challenge', [
    encodeCVArg(principalCV(challengerAddr)),
  ]);
}

export async function cancelChallenge() {
  return callPvPContract('cancel-challenge', []);
}

export async function fetchPendingChallenge(challengerAddr) {
  const apiBase = CONFIG.leaderboardApiBaseUrl;
  const res = await fetch(`${apiBase}/api/pvp/challenges/${encodeURIComponent(challengerAddr)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result ?? null;
}

export async function makePvPMove(row, col) {
  return callPvPContract('make-pvp-move', [
    encodeCVArg(uintCV(row)),
    encodeCVArg(uintCV(col)),
  ]);
}

export async function recordPvPResult(walletAddr, outcome, month) {
  const apiBase = CONFIG.leaderboardApiBaseUrl;
  const body = { walletAddr, outcome };
  if (month) body.month = month;
  const res = await fetch(`${apiBase}/api/pvp/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`recordPvPResult failed: ${res.status}`);
  return res.json();
}

export async function syncPvPGameState(gameId) {
  const apiBase = CONFIG.leaderboardApiBaseUrl;
  const res = await fetch(`${apiBase}/api/pvp/game/${gameId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createRematch(opponentAddr) {
  return createChallenge(opponentAddr);
}

export async function fetchIncomingChallenges(playerAddr) {
  const apiBase = CONFIG.leaderboardApiBaseUrl;
  try {
    const res = await fetch(`${apiBase}/api/pvp/incoming/${encodeURIComponent(playerAddr)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.incoming?.map(c => ({
      challenger: c.challenger,
      createdAt: c.createdAt
    })) || [];
  } catch (error) {
    console.error('Failed to fetch incoming challenges:', error);
    return [];
  }
}
