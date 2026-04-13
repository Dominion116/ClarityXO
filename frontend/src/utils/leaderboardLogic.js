import { openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { uintCV, principalCV } from '@stacks/transactions';
import { CONFIG } from '../config';
import { callReadOnly, encodeCVArg } from './stacks';

const PTS = { win: 3, draw: 1, loss: 0 };

// Track players discovered this session (from game results)
let discoveredPlayers = new Set();

const MOCK_LEADERBOARD_PLAYERS = {
  SP2C2YB2M7WZ8Q4P8A9VQYQMW9C03R9X62H2W8A1K: { pts: 41, wins: 13, draws: 2, losses: 4 },
  SP1A9H5Y3N7Q4Z6P2K8T9R5M1X3C7V9B2D8E4F6G: { pts: 36, wins: 11, draws: 3, losses: 5 },
  SP3D6K9Q2R4V7M1X8P5A2Y6C9N3B7H4T1W8Z5J2L: { pts: 31, wins: 9, draws: 4, losses: 6 },
  SP18W6Q3N9R2D5X7V4A1K8M2Y5C9P3H6T4B7Z1F8: { pts: 27, wins: 8, draws: 3, losses: 7 },
  SP2Z4P8M1C7V3B9N6D2A5X8Y1Q4R7T3H9K6W2J5L: { pts: 22, wins: 6, draws: 4, losses: 8 },
  SP35R1T8Y4U7I2O9P6A3S5D8F1G4H7J2K9L6Z3X5C: { pts: 17, wins: 5, draws: 2, losses: 9 },
};

export function recordPlayerDiscovered(addr) {
  if (addr && addr !== 'anonymous') {
    discoveredPlayers.add(addr);
  }
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
    // Demo mode fallback when there are no discovered on-chain players yet.
    if (discoveredPlayers.size === 0) {
      return { players: MOCK_LEADERBOARD_PLAYERS, _source: 'mock' };
    }

    // Query each discovered player's stats from contract
    const contractPlayers = {};
    
    for (const addr of discoveredPlayers) {
      try {
        const response = await callReadOnly("get-my-stats-this-month", [
          encodeCVArg(principalCV(addr))
        ]);
        
        if (response.result && response.result.includes("ok")) {
          // Parse the contract response: (ok { pts: u..., wins: u..., draws: u..., losses: u... })
          const pts = parseInt(response.result.match(/pts:\s*u(\d+)/)?.[1] || "0", 10);
          const wins = parseInt(response.result.match(/wins:\s*u(\d+)/)?.[1] || "0", 10);
          const draws = parseInt(response.result.match(/draws:\s*u(\d+)/)?.[1] || "0", 10);
          const losses = parseInt(response.result.match(/losses:\s*u(\d+)/)?.[1] || "0", 10);
          
          if (pts > 0 || wins > 0 || draws > 0 || losses > 0) {
            contractPlayers[addr] = { pts, wins, draws, losses };
          }
        }
      } catch (e) {
        console.error(`Error fetching stats for ${addr}:`, e);
      }
    }
    
    if (Object.keys(contractPlayers).length === 0) {
      return { players: MOCK_LEADERBOARD_PLAYERS, _source: 'mock' };
    }

    return { players: contractPlayers, _source: "contract" };
  } catch (e) {
    console.error("Error fetching from contract:", e);
    return { players: MOCK_LEADERBOARD_PLAYERS, _source: 'mock' };
  }
}

// Record result - only tracks player discovery, no localStorage saving
export function recordResult(addr, outcome) {
  recordPlayerDiscovered(addr);
  return PTS[outcome];
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
  console.log("To clear on-chain leaderboard, contract owner must invoke clear function");
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
    const network = CONFIG.network === "mainnet" ? new StacksMainnet() : new StacksTestnet();
    
    await openContractCall({
      network,
      contractAddress: CONFIG.nftContractAddress,
      contractName: CONFIG.nftContractName,
      functionName: "claim-trophy",
      functionArgs: [
        uintCV(await getCurrentMonthNumber() - 1),
      ],
      appDetails: { name: "ClarityXO", icon: "data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2232%22 height%3D%2232%22 viewBox%3D%220 0 32 32%22%3E%3Crect width%3D%2232%22 height%3D%2232%22 fill%3D%22%230a0a0a%22%2F%3E%3Cline x1%3D%228%22 y1%3D%228%22 x2%3D%2224%22 y2%3D%2224%22 stroke%3D%22%23ff4444%22 stroke-width%3D%222.5%22%2F%3E%3Cline x1%3D%2224%22 y1%3D%228%22 x2%3D%228%22 y2%3D%2224%22 stroke%3D%22%23ff4444%22 stroke-width%3D%222.5%22%2F%3E%3C%2Fsvg%3E" },
      onFinish: (d) => {
        addLog(`NFT Trophy claimed! TX: ${d.txId?.slice(0,16)}…`, "success");
      },
      onCancel: () => addLog("NFT claim cancelled.", "error"),
    });
    return true; // indicates success intent
  } catch (e) {
    addLog(`NFT claim error: ${e.message}`, "error");
    return false;
  }
}
