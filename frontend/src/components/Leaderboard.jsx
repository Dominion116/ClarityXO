import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const isDeployer = walletAddr === CONFIG.contractAddress;
  const claimReady = countdown === "00:00:00";

  // Prevent overlapping fetch calls
  const fetchingRef = useRef(false);

  const loadLeaderboard = useCallback(async () => {
    // Skip if already fetching
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoading(true);
      const contractData = await fetchLeaderboardFromContract();
      setData(contractData);
      setPlayers(getPlayerList(contractData));
    } catch (e) {
      console.error("Error loading leaderboard:", e);
      setData({ players: {} });
      setPlayers([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const refresh = async () => {
    await loadLeaderboard();
  };

  useEffect(() => {
    // Load once on mount
    loadLeaderboard();

    // Countdown timer
    setCountdown(formatCountdown(getMonthEnd() - Date.now()));
    const countdownInterval = setInterval(() => {
      const ms = getMonthEnd() - Date.now();
      setCountdown(formatCountdown(ms));
    }, 1000);

    // Auto-refresh every 60s
    const refreshInterval = setInterval(() => {
      loadLeaderboard();
    }, 60000);

    // Refresh when a game result is recorded (custom event from game page)
    const handleGameResultRecorded = () => {
      // Small delay so the backend POST has time to commit
      setTimeout(() => loadLeaderboard(), 500);
    };
    window.addEventListener('gameResultRecorded', handleGameResultRecorded);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(refreshInterval);
      window.removeEventListener('gameResultRecorded', handleGameResultRecorded);
    };
  }, [loadLeaderboard]);

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

  // Show loading skeleton on first load only
  if (!data && loading) {
    const SkeletonSlots = Array(5).fill(0).map((_, i) => (
      <div key={i} className="nft-slot skeleton-box" style={{ border: 'none' }}></div>
    ));

    const SkeletonRows = Array(10).fill(0).map((_, i) => (
      <tr key={i}>
        <td><div className="skeleton-box skeleton-text short"></div></td>
        <td><div className="skeleton-box skeleton-text medium"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
        <td><div className="skeleton-box skeleton-text"></div></td>
      </tr>
    ));

    return (
      <div className="page active" id="page-leaderboard">
        {/* Skeleton NFT Banner */}
        <div className="nft-banner">
          <div className="nft-banner-inner">
            <div className="nft-banner-left">
              <div className="nft-icon skeleton-box" style={{ border: 'none', background: 'var(--border)' }}></div>
              <div style={{ flex: 1, width: '100%' }}>
                <div className="skeleton-box skeleton-text short" style={{ marginBottom: '12px', height: '10px' }}></div>
                <div className="skeleton-box skeleton-text" style={{ marginBottom: '6px' }}></div>
                <div className="skeleton-box skeleton-text medium"></div>
              </div>
            </div>
          </div>
          <div className="nft-qualifiers">
            <div className="nft-q-label skeleton-box skeleton-text short" style={{ width: '60px' }}></div>
            {SkeletonSlots}
          </div>
        </div>

        {/* Skeleton Header */}
        <div className="lb-header">
          <div className="lb-header-left">
            <div className="lb-title">Leaderboard</div>
            <div className="skeleton-box skeleton-text short" style={{ marginTop: '8px' }}></div>
          </div>
        </div>

        {/* Skeleton Legend */}
        <div className="pts-legend">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="pts-item">
               <div className="skeleton-box" style={{ width: '32px', height: '24px', borderRadius: '4px' }}></div>
               <div style={{ flex: 1 }}><div className="skeleton-box skeleton-text short" style={{ marginBottom: '6px' }}></div><div className="skeleton-box skeleton-text"></div></div>
            </div>
          ))}
        </div>

        {/* Skeleton Stats */}
        <div className="lb-stats">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="lb-stat">
              <div className="skeleton-box skeleton-text short" style={{ marginBottom: '12px' }}></div>
              <div className="skeleton-box skeleton-text" style={{ height: '24px', width: '50%' }}></div>
            </div>
          ))}
        </div>

        {/* Skeleton Table */}
        <table className="lb-table">
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
          <tbody>
            {SkeletonRows}
          </tbody>
        </table>
      </div>
    );
  }

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
        <button className="lb-action-btn" onClick={refresh}>↻ Refresh</button>
        <button className="lb-action-btn" onClick={handleClaim} disabled={!claimReady}>◈ Claim NFT (Top 5)</button>
        {isDeployer && <button className="lb-action-btn danger" onClick={handleClear}>Clear Data</button>}
      </div>

      <div className="footer">
        Points reset monthly · NFT minted on Stacks · <span className="yr">{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
