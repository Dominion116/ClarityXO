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
