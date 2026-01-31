import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '../config';

export interface PlayerStats {
  address: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lastPlayed: number; // timestamp
}

export interface GameRecord {
  txId: string;
  playerAddress: string;
  result: 'win' | 'loss' | 'draw';
  timestamp: number;
  blockHeight: number;
}

const STATS_CACHE_KEY = 'clarityxo_stats';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedStats {
  stats: Map<string, PlayerStats>;
  games: GameRecord[];
  timestamp: number;
}

/**
 * Fetch transactions for the contract from Stacks API
 */
async function fetchContractTransactions(limit = 50, offset = 0): Promise<any[]> {
  try {
    const baseUrl = NETWORK.coreApiUrl;
    const url = `${baseUrl}/extended/v1/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/transactions?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Parse transaction to determine game outcome
 */
function parseGameOutcome(tx: any): GameRecord | null {
  try {
    // Only process successful contract calls
    if (tx.tx_type !== 'contract_call' || tx.tx_status !== 'success') {
      return null;
    }

    const functionName = tx.contract_call?.function_name;
    
    // We only care about make-move transactions
    if (functionName !== 'make-move') {
      return null;
    }

    const playerAddress = tx.sender_address;
    
    // Parse the transaction result to determine outcome
    // The transaction events might contain the game status
    let result: 'win' | 'loss' | 'draw' = 'draw';
    
    // Check transaction events for game outcome
    if (tx.tx_result?.repr) {
      const repr = tx.tx_result.repr;
      // If the result contains success/ok, parse further
      // This is a simplified parser - actual parsing may need refinement
      if (repr.includes('(ok')) {
        // Game is still active or completed
        // We'd need to check the game-status from the contract state
        // For now, we'll mark as played and refine later
        result = 'draw'; // Default to draw, will be updated by fetching game state
      }
    }

    return {
      txId: tx.tx_id,
      playerAddress,
      result,
      timestamp: tx.burn_block_time,
      blockHeight: tx.block_height,
    };
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
}

/**
 * Aggregate game records into player statistics
 */
function aggregateStats(games: GameRecord[]): Map<string, PlayerStats> {
  const statsMap = new Map<string, PlayerStats>();

  games.forEach((game) => {
    const existing = statsMap.get(game.playerAddress) || {
      address: game.playerAddress,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      lastPlayed: 0,
    };

    existing.gamesPlayed += 1;
    if (game.result === 'win') existing.wins += 1;
    if (game.result === 'loss') existing.losses += 1;
    if (game.result === 'draw') existing.draws += 1;
    existing.lastPlayed = Math.max(existing.lastPlayed, game.timestamp);

    // Calculate win rate
    existing.winRate = existing.gamesPlayed > 0 
      ? (existing.wins / existing.gamesPlayed) * 100 
      : 0;

    statsMap.set(game.playerAddress, existing);
  });

  return statsMap;
}

/**
 * Load stats from localStorage cache
 */
function loadFromCache(): CachedStats | null {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - parsed.timestamp > CACHE_DURATION) {
      return null;
    }

    // Convert plain objects back to Map
    const statsMap = new Map<string, PlayerStats>(
      Object.entries(parsed.stats)
    );

    return {
      stats: statsMap,
      games: parsed.games,
      timestamp: parsed.timestamp,
    };
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

/**
 * Save stats to localStorage cache
 */
function saveToCache(stats: Map<string, PlayerStats>, games: GameRecord[]): void {
  try {
    const cacheData = {
      stats: Object.fromEntries(stats),
      games,
      timestamp: Date.now(),
    };
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

/**
 * Fetch and calculate player statistics
 */
export async function fetchPlayerStats(forceRefresh = false): Promise<{
  stats: Map<string, PlayerStats>;
  games: GameRecord[];
}> {
  // Try loading from cache first
  if (!forceRefresh) {
    const cached = loadFromCache();
    if (cached) {
      return { stats: cached.stats, games: cached.games };
    }
  }

  try {
    // Fetch transactions from API (limit to recent 200 transactions)
    const allTransactions: any[] = [];
    const batchSize = 50;
    const maxTransactions = 200;

    for (let offset = 0; offset < maxTransactions; offset += batchSize) {
      const batch = await fetchContractTransactions(batchSize, offset);
      if (batch.length === 0) break;
      allTransactions.push(...batch);
      if (batch.length < batchSize) break; // No more transactions
    }

    // Parse transactions into game records
    const games: GameRecord[] = allTransactions
      .map(parseGameOutcome)
      .filter((game): game is GameRecord => game !== null);

    // Aggregate into player statistics
    const stats = aggregateStats(games);

    // Save to cache
    saveToCache(stats, games);

    return { stats, games };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    
    // Return empty stats on error
    return {
      stats: new Map(),
      games: [],
    };
  }
}

/**
 * Get leaderboard sorted by wins
 */
export function getLeaderboard(
  stats: Map<string, PlayerStats>,
  sortBy: 'wins' | 'winRate' | 'gamesPlayed' = 'wins'
): PlayerStats[] {
  const players = Array.from(stats.values());

  players.sort((a, b) => {
    if (sortBy === 'wins') {
      return b.wins - a.wins || b.winRate - a.winRate;
    } else if (sortBy === 'winRate') {
      // Only consider players with at least 3 games for win rate sorting
      const aValid = a.gamesPlayed >= 3;
      const bValid = b.gamesPlayed >= 3;
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      return b.winRate - a.winRate || b.wins - a.wins;
    } else {
      return b.gamesPlayed - a.gamesPlayed;
    }
  });

  return players;
}

/**
 * Get player statistics by address
 */
export function getPlayerStatsByAddress(
  stats: Map<string, PlayerStats>,
  address: string
): PlayerStats | null {
  return stats.get(address) || null;
}

/**
 * Clear stats cache
 */
export function clearStatsCache(): void {
  localStorage.removeItem(STATS_CACHE_KEY);
}
