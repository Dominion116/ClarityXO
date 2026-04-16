import React, { useState, useEffect } from 'react';
import { fetchLeaderboardFromContract, getPlayerList, clearLeaderboardData, claimNFT, getMonthEnd, formatCountdown } from '../utils/leaderboardLogic';
import { CONFIG } from '../config';

const PAGE_SIZE = 10;

function calculateWinRate(wins, games) {
  if (!games) return 0;
  return (wins / games) * 100;
}

export default function Leaderboard({ walletAddr, addLog, navigate }) {
  const [data, setData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState("—");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const isDeployer = walletAddr === CONFIG.contractAddress;
  const claimReady = countdown === "00:00:00";

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch  from contract
      const contractData = await fetchLeaderboardFromContract();
      setData(contractData);
      setPlayers(getPlayerList(contractData));
    } catch (e) {
      console.error("Error loading leaderboard:", e);
      setData({ players: {} });
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!isDeployer) return;
    await loadLeaderboard();
  };

  useEffect(() => {
    loadLeaderboard();
    setCountdown(formatCountdown(getMonthEnd() - Date.now()));
    const interval = setInterval(() => {
      const ms = getMonthEnd() - Date.now();
      setCountdown(formatCountdown(ms));
    }, 1000);
    const refreshInterval = setInterval(() => {
      loadLeaderboard();
    }, 60000);

    // Refresh immediately when a game result is recorded
    const handleGameResultRecorded = () => {
      loadLeaderboard();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadLeaderboard();
      }
    };

    window.addEventListener('focus', loadLeaderboard);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('gameResultRecorded', handleGameResultRecorded);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
      window.removeEventListener('focus', loadLeaderboard);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('gameResultRecorded', handleGameResultRecorded);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [data?.month, players.length]);

  const handleClear = () => {
    if (clearLeaderboardData(walletAddr)) refresh();
  };

  const handleClaim = async () => {
    if (!claimReady) {
      addLog("NFT claims open when the countdown ends.", "info");
      return;
    }
    if (await claimNFT(walletAddr, addLog, data)) {
      navigate('game');
    }
  };

  if (!data) return null;

  const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visiblePlayers = players.slice(startIndex, endIndex);

  const totalGames = players.reduce((s, p) => s + p.games, 0);
  const totalWins = players.reduce((s, p) => s + p.wins, 0);
  const totalPts = players.reduce((s, p) => s + p.pts, 0);
  const totalDraws = players.reduce((s, p) => s + p.draws, 0);

  const nftSlots = [0, 1, 2, 3, 4].map(i => {
    const p = players[i];
    if (p) {
      const short = p.addr === "anonymous" ? "anon" : `${p.addr.slice(0, 8)}…${p.addr.slice(-4)}`;
      const isYou = walletAddr && p.addr === walletAddr;
      return (
        <div key={i} className={`nft-slot filled ${isYou ? 'you-slot' : ''}`}>
          <span className="nft-slot-rank">#{i + 1}</span>
          <span className="nft-slot-addr">{short} ({p.pts}pt)</span>
        </div>
      );
    }
    return (
      <div key={i} className="nft-slot">
        <span className="nft-slot-rank">#{i + 1}</span>
        <span className="nft-slot-addr">—</span>
      </div>
    );
  });

  return (
    <div className="page active" id="page-leaderboard">
      {/* NFT Prize Banner */}
      <div className="nft-banner" id="nft-banner">
        <div className="nft-banner-inner">
          <div className="nft-banner-left">
            <div className="nft-icon">◈</div>
            <div>
              <div className="nft-label">Monthly Prize</div>
              <div className="nft-desc">
                <strong>Top 5 players this month earn a ClarityXO Trophy NFT</strong> minted to your Stacks wallet at month end. Win = 3 pts · Draw = 1 pt · Loss = 0 pts.
              </div>
            </div>
          </div>
          <div className="nft-timer-wrap">
            <div className="nft-timer-label">Month resets in</div>
            <div className="nft-timer" id="nft-countdown">{countdown}</div>
          </div>
        </div>
        <div className="nft-qualifiers">
          <div className="nft-q-label">NFT eligible →</div>
          {nftSlots}
        </div>
      </div>

      {/* Header */}
      <div className="lb-header">
        <div className="lb-header-left">
          <div className="lb-title">Leaderboard</div>
          <div className="lb-week" id="lb-month-label">Month {data.month}</div>
        </div>
        <div className="lb-meta" id="lb-last-updated">
          Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Points Legend */}
      <div className="pts-legend">
        <div className="pts-item">
          <div className="pts-badge win">+3</div>
          <div className="pts-detail"><strong>Win</strong>Beat the computer</div>
        </div>
        <div className="pts-item">
          <div className="pts-badge draw">+1</div>
          <div className="pts-detail"><strong>Draw</strong>No winner</div>
        </div>
        <div className="pts-item">
          <div className="pts-badge loss">+0</div>
          <div className="pts-detail"><strong>Loss</strong>Computer wins</div>
        </div>
      </div>

      {/* Stats */}
      <div className="lb-stats">
        <div className="lb-stat">
          <div className="lb-stat-label">Games This Month</div>
          <div className="lb-stat-val" id="lb-total-games">{totalGames}</div>
        </div>
        <div className="lb-stat">
          <div className="lb-stat-label">Player Wins</div>
          <div className="lb-stat-val green" id="lb-total-wins">{totalWins}</div>
        </div>
        <div className="lb-stat">
          <div className="lb-stat-label">Total Points</div>
          <div className="lb-stat-val gold" id="lb-total-pts">{totalPts}</div>
        </div>
        <div className="lb-stat">
          <div className="lb-stat-label">Draws</div>
          <div className="lb-stat-val" id="lb-total-draws">{totalDraws}</div>
        </div>
      </div>

      {/* Rankings Table */}
      <table className="lb-table" id="lb-table" style={{ display: players.length === 0 ? 'none' : '' }}>
        <thead>
          <tr>
            <th style={{ width: 58 }}>Rank</th>
            <th>Player</th>
            <th style={{ width: 72 }}>Points</th>
            <th style={{ width: 64 }}>Wins</th>
            <th style={{ width: 64 }}>Draws</th>
            <th style={{ width: 64 }}>Losses</th>
            <th style={{ width: 64 }}>Games</th>
            <th style={{ width: 110 }}>Win Rate</th>
          </tr>
        </thead>
        <tbody id="lb-tbody">
          {visiblePlayers.map((p, i) => {
            const rank = startIndex + i + 1;
            const nftZone = rank <= 5;
            const isMe = walletAddr ? p.addr === walletAddr : p.addr === "anonymous";
            const winRate = calculateWinRate(p.wins, p.games);

            const medalClass =
              rank === 1 ? "medal-1" :
                rank === 2 ? "medal-2" :
                  rank === 3 ? "medal-3" :
                    nftZone ? "medal-nft" : "medal-n";

            const short = p.addr === "anonymous"
              ? "anonymous"
              : p.addr.length > 26 ? `${p.addr.slice(0, 13)}…${p.addr.slice(-6)}` : p.addr;

            return (
              <tr key={p.addr} className={nftZone ? 'nft-eligible' : ''} style={isMe ? { background: 'rgba(255,68,68,0.04)' } : {}}>
                <td>
                  <div className="lb-rank-cell">
                    <div className={`lb-medal ${medalClass}`}>{rank}</div>
                    {nftZone && <div className="nft-pip" title="NFT eligible"></div>}
                  </div>
                </td>
                <td>
                  <div className="lb-addr-cell">
                    <span className={p.addr === "anonymous" ? "lb-anon" : ""}>{short}</span>
                    {isMe && <span className="lb-you">You</span>}
                  </div>
                </td>
                <td className="pts-col">{p.pts}</td>
                <td className="win-col">{p.wins}</td>
                <td className="draw-col">{p.draws}</td>
                <td className="loss-col">{p.losses}</td>
                <td>{p.games}</td>
                <td>
                  <div className="winrate-wrap">
                    <div className="wr-bar">
                      <div className="wr-fill" style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}></div>
                    </div>
                    <div className="wr-pct">{winRate.toFixed(1)}%</div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {players.length > 0 && (
        <div className="lb-pagination">
          <div className="lb-pagination-meta">
            Showing {startIndex + 1}-{Math.min(players.length, endIndex)} of {players.length}
          </div>
          <div className="lb-pagination-controls">
            <button
              className="lb-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Prev
            </button>
            <span className="lb-page-indicator">Page {currentPage} / {totalPages}</span>
            <button
              className="lb-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="lb-empty" id="lb-empty">
          No games recorded this month.<br />Play a game to claim your spot.
        </div>
      )}

      {/* Actions */}
      <div className="lb-actions">
        {isDeployer && <button className="lb-action-btn" onClick={refresh}>↻ Refresh</button>}
        <button className="lb-action-btn" onClick={handleClaim} disabled={!claimReady}>◈ Claim NFT (Top 5)</button>
        {isDeployer && <button className="lb-action-btn danger" onClick={handleClear}>Clear Data</button>}
      </div>

      <div className="footer">
        Points reset monthly · NFT minted on Stacks · <span className="yr">{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
