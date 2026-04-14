import { uintCV } from '@stacks/transactions';
import { CONFIG } from '../config';
import { encodeCVArg } from './stacks';

const PTS = { win: 3, draw: 1, loss: 0 };

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function apiUrl(path) {
  return `${CONFIG.leaderboardApiBaseUrl}${path}`;
}

export function getMonthEnd() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const end = new Date(Date.UTC(year, month, lastDay.getUTCDate(), 23, 59, 59));
  return end;
}

export async function getCurrentMonthNumber() {
  try {
    const res = await fetch(
      `https://stacks-node-api.${CONFIG.network}.stacks.co/v2/info`
    );
    const data = await res.json();
    const burnHeight = data.burn_block_height || 0;
    return Math.floor(burnHeight / 4320); // BLOCKS_PER_MONTH
  } catch (e) {
    console.error("Error fetching current month:", e);
    return 0;
  }
}

export function formatCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m`;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// Fetch leaderboard stats from the smart contract
export async function fetchLeaderboardFromContract() {
  try {
    const month = getMonthKey();
    const res = await fetch(apiUrl(`/api/leaderboard?month=${encodeURIComponent(month)}`));
    if (!res.ok) throw new Error(`Leaderboard API error: ${res.status}`);
    const payload = await res.json();
    return { month: payload.month || month, players: payload.players || {}, _source: payload.source || 'backend' };
  } catch (e) {
    console.error('Error fetching leaderboard from backend:', e);
    return { month: getMonthKey(), players: {}, _source: 'backend-error' };
  }
}

export function recordResult(addr, outcome) {
  const walletAddr = addr || 'anonymous';
  const earned = PTS[outcome];

  fetch(apiUrl('/api/leaderboard/result'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddr,
      outcome,
      month: getMonthKey(),
    }),
  }).catch(err => {
    console.error('Failed to persist leaderboard result:', err);
  });

  return earned;
}

export function getPlayerList(data) {
  return Object.entries(data.players)
    .map(([addr, s]) => ({
      addr,
      pts: s.pts,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      games: s.wins + s.draws + s.losses,
    }))
    .sort((a, b) => b.pts - a.pts || b.wins - a.wins || a.losses - b.losses);
}

export function clearLeaderboardData(walletAddr) {
  if (walletAddr !== CONFIG.contractAddress) return false;
  if (!window.confirm("Clear all leaderboard data for this month? This cannot be undone. Contact contract owner.")) return false;

  const month = getMonthKey();
  fetch(apiUrl(`/api/leaderboard?month=${encodeURIComponent(month)}`), {
    method: 'DELETE',
  }).catch(err => {
    console.error('Failed to clear leaderboard on backend:', err);
  });

  return true;
}

export async function claimNFT(walletAddr, addLog, leaderboardData) {
  if (!walletAddr) { alert("Connect your wallet first to verify eligibility."); return false; }
  if (Date.now() < getMonthEnd().getTime()) {
    addLog("NFT claims open when the countdown ends.", "info");
    return false;
  }

  const players = getPlayerList(leaderboardData);
  const myRank = players.findIndex(p => p.addr === walletAddr);
  
  if (myRank === -1 || myRank >= 5) {
    alert("You are not in the top 5 this month. Keep playing to earn a spot!");
    return false;
  }

  const pts = players[myRank].pts;
  addLog(`Claiming NFT Trophy for rank #${myRank + 1} (${pts} pts)…`, "info");

  try {
    if (!window.LeatherProvider) {
      throw new Error("Leather wallet not found");
    }

    const response = await window.LeatherProvider.request("stx_callContract", {
      contract: `${CONFIG.nftContractAddress}.${CONFIG.nftContractName}`,
      functionName: "claim-trophy",
      functionArgs: [encodeCVArg(uintCV(await getCurrentMonthNumber() - 1))],
      network: CONFIG.network,
    });

    addLog(`NFT Trophy claimed! TX: ${response?.result?.txid?.slice(0,16)}…`, "success");
    return true; // indicates success intent
  } catch (e) {
    addLog(`NFT claim error: ${e.message}`, "error");
    return false;
  }
}
