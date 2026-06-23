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

export async function fetchIncomingChallenge(playerAddr, knownChallengers = []) {
  const results = await Promise.all(
    knownChallengers.map(async (addr) => {
      const apiBase = CONFIG.leaderboardApiBaseUrl;
      try {
        const res = await fetch(`${apiBase}/api/pvp/challenges/${encodeURIComponent(addr)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.result ? { challenger: addr, raw: data.result } : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean).filter((r) => {
    return String(r.raw).includes(playerAddr);
  });
}
