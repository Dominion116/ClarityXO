import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, TrendingUp, Award, Target } from 'lucide-react';
import {
  fetchPlayerStats,
  getLeaderboard,
  getPlayerStatsByAddress,
  clearStatsCache,
  PlayerStats,
} from '../utils/stats';
import { getUserData } from '../auth';

type SortOption = 'wins' | 'winRate' | 'gamesPlayed';

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('wins');
  const [currentUserStats, setCurrentUserStats] = useState<PlayerStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const { stats } = await fetchPlayerStats(forceRefresh);
      const leaderboard = getLeaderboard(stats, sortBy);
      setPlayers(leaderboard);

      // Get current user's stats if authenticated
      const userData = getUserData();
      const userAddress = userData?.profile?.stxAddress?.testnet;
      if (userAddress) {
        const userStats = getPlayerStatsByAddress(stats, userAddress);
        setCurrentUserStats(userStats);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearStatsCache();
    await loadStats(true);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="neo-card max-w-4xl w-full">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-neo-accent" />
          <span className="ml-3 text-lg text-neo-text">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card max-w-4xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl shadow-neo-sm">
            <Trophy className="w-6 h-6 text-neo-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neo-text">Leaderboard</h2>
            <p className="text-sm text-neo-text opacity-70">
              {players.length} player{players.length !== 1 ? 's' : ''} ranked
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="neo-button flex items-center gap-2 !px-4 !py-2"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Current User Stats */}
      {currentUserStats && (
        <div className="neo-inset p-4 rounded-xl mb-6">
          <h3 className="text-sm font-semibold text-neo-text opacity-70 mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-neo-accent">{currentUserStats.gamesPlayed}</p>
              <p className="text-xs text-neo-text opacity-70">Games</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentUserStats.wins}</p>
              <p className="text-xs text-neo-text opacity-70">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{currentUserStats.losses}</p>
              <p className="text-xs text-neo-text opacity-70">Losses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neo-text">{currentUserStats.draws}</p>
              <p className="text-xs text-neo-text opacity-70">Draws</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neo-accent">
                {currentUserStats.winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-neo-text opacity-70">Win Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => handleSortChange('wins')}
          className={`neo-button-sm flex items-center gap-2 ${
            sortBy === 'wins' ? 'ring-2 ring-neo-accent' : ''
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Most Wins</span>
        </button>
        <button
          onClick={() => handleSortChange('winRate')}
          className={`neo-button-sm flex items-center gap-2 ${
            sortBy === 'winRate' ? 'ring-2 ring-neo-accent' : ''
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Win Rate</span>
        </button>
        <button
          onClick={() => handleSortChange('gamesPlayed')}
          className={`neo-button-sm flex items-center gap-2 ${
            sortBy === 'gamesPlayed' ? 'ring-2 ring-neo-accent' : ''
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Most Active</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      {players.length === 0 ? (
        <div className="neo-inset p-8 rounded-xl text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-neo-text opacity-30" />
          <p className="text-neo-text opacity-70">No games played yet</p>
          <p className="text-sm text-neo-text opacity-50 mt-1">
            Be the first to play and claim the top spot!
          </p>
        </div>
      ) : (
        <div className="neo-inset rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neo-shadow-dark/20">
                  <th className="text-left p-3 text-sm font-semibold text-neo-text opacity-70">
                    Rank
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-neo-text opacity-70">
                    Player
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-neo-text opacity-70">
                    Games
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-neo-text opacity-70">
                    W/L/D
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-neo-text opacity-70">
                    Win Rate
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-neo-text opacity-70">
                    Last Played
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => {
                  const isCurrentUser =
                    getUserData()?.profile?.stxAddress?.testnet === player.address;
                  return (
                    <tr
                      key={player.address}
                      className={`border-b border-neo-shadow-dark/10 last:border-0 ${
                        isCurrentUser ? 'bg-neo-accent/5' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <span className="text-xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-neo-text opacity-50">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-mono text-neo-text break-all"
                            title={player.address}
                          >
                            {formatAddress(player.address)}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neo-accent text-white">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm font-semibold text-neo-text">
                          {player.gamesPlayed}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs font-mono text-neo-text">
                          <span className="text-green-600">{player.wins}</span>
                          <span className="opacity-50"> / </span>
                          <span className="text-red-600">{player.losses}</span>
                          <span className="opacity-50"> / </span>
                          <span>{player.draws}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-sm font-semibold ${
                            player.winRate >= 60
                              ? 'text-green-600'
                              : player.winRate >= 40
                              ? 'text-neo-accent'
                              : 'text-red-600'
                          }`}
                        >
                          {player.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs text-neo-text opacity-70">
                          {formatDate(player.lastPlayed)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neo-text opacity-50">
          Stats are cached for 5 minutes. Click refresh for latest data.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
