import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLeaderboardFromContract, fetchAvailableMonths, getPlayerList, clearLeaderboardData, claimNFT, getMonthEnd, formatCountdown } from '../utils/leaderboardLogic';
import { resolveAddressNames } from '../utils/bns';
import { fetchPlayerProfiles } from '../utils/profile';
import { CONFIG } from '../config';
import PlayerProfile from './PlayerProfile';

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
  const [bnsNames, setBnsNames] = useState({});
  const [profiles, setProfiles] = useState({});
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [profileAddress, setProfileAddress] = useState(null);
  const isDeployer = walletAddr === CONFIG.contractAddress;
  const claimReady = countdown === "00:00:00";
  const isViewingHistory = selectedMonth !== null;

  // Sync selectedMonth to/from URL search param for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMonth = params.get('month');
    if (urlMonth && urlMonth !== selectedMonth) {
      setSelectedMonth(urlMonth);
      loadLeaderboard(urlMonth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent overlapping fetch calls
  const fetchingRef = useRef(false);

  const loadLeaderboard = useCallback(async (month = null) => {
    // Skip if already fetching
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoading(true);
      const contractData = await fetchLeaderboardFromContract(month);
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
    await loadLeaderboard(selectedMonth);
  };

  const handleMonthChange = (month) => {
    const next = month === '__current__' ? null : month;
    setSelectedMonth(next);
    setPage(1);
    loadLeaderboard(next);

    // Update URL param for deep linking
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set('month', next);
    } else {
      url.searchParams.delete('month');
    }
    window.history.replaceState(null, '', url.toString());
  };

  useEffect(() => {
    // Load once on mount (current month)
    loadLeaderboard(null);

    // Fetch available months for season archive picker
    fetchAvailableMonths().then(setAvailableMonths);

    // Countdown timer
    setCountdown(formatCountdown(getMonthEnd() - Date.now()));
    const countdownInterval = setInterval(() => {
      const ms = getMonthEnd() - Date.now();
      setCountdown(formatCountdown(ms));
    }, 1000);

    // Auto-refresh every 60s (only for current month view)
    const refreshInterval = setInterval(() => {
      if (!isViewingHistory) loadLeaderboard(null);
    }, 60000);

    // Refresh when a game result is recorded (custom event from game page)
    const handleGameResultRecorded = () => {
      // Small delay so the backend POST has time to commit
      if (!isViewingHistory) setTimeout(() => loadLeaderboard(null), 500);
    };
    window.addEventListener('gameResultRecorded', handleGameResultRecorded);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(refreshInterval);
      window.removeEventListener('gameResultRecorded', handleGameResultRecorded);
    };
  }, [loadLeaderboard, isViewingHistory]);

  useEffect(() => {
    setPage(1);
  }, [data?.month, players.length]);

  // Resolve BNS names + Gaia profiles for top-5 slots + current visible page
  useEffect(() => {
    if (!players.length) return;
    const top5 = players.slice(0, 5).map(p => p.addr);
    const currentPage = Math.max(1, page);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageAddrs = players.slice(startIndex, startIndex + PAGE_SIZE).map(p => p.addr);
    const unique = [...new Set([...top5, ...pageAddrs])].filter(a => a !== 'anonymous');
    resolveAddressNames(unique).then(resolved => {
      setBnsNames(prev => ({ ...prev, ...resolved }));
    });
    fetchPlayerProfiles(unique).then(resolved => {
      setProfiles(prev => ({ ...prev, ...resolved }));
    });
  }, [players, page]);

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
      const bnsName = bnsNames[p.addr];
      const display = p.addr === "anonymous" ? "anon"
        : bnsName ? bnsName
        : `${p.addr.slice(0, 8)}…${p.addr.slice(-4)}`;
      const isYou = walletAddr && p.addr === walletAddr;
      return (
        <div key={i} className={`nft-slot filled ${isYou ? 'you-slot' : ''}`}>
          <span className="nft-slot-rank">#{i + 1}</span>
          <span className="nft-slot-addr" title={p.addr}>{display} ({p.pts}pt)</span>
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
      {/* Season Archive Banner */}
      {isViewingHistory && (
        <div className="lb-archive-banner">
          <span>Viewing archived season — {selectedMonth}</span>
          <button className="lb-archive-back" onClick={() => handleMonthChange('__current__')}>
            ← Current Month
          </button>
        </div>
      )}

      {/* NFT Prize Banner — hidden when viewing a historical season */}
      <div className="nft-banner" id="nft-banner" style={isViewingHistory ? { display: 'none' } : {}}>
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
          <div className="lb-week" id="lb-month-label">
            {isViewingHistory ? `Archive — ${selectedMonth}` : `Month ${data.month}`}
          </div>
        </div>
        <div className="lb-header-right">
          {availableMonths.length > 0 && (
            <select
              className="lb-month-picker"
              value={selectedMonth || '__current__'}
              onChange={(e) => handleMonthChange(e.target.value)}
              aria-label="Select month"
            >
              <option value="__current__">Current Month</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
          <div className="lb-meta" id="lb-last-updated">
            Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
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

            const bnsName = bnsNames[p.addr];
            const profile = profiles[p.addr];
            const displayName = p.addr === "anonymous"
              ? "anonymous"
              : profile?.name ?? bnsName
              ?? (p.addr.length > 26 ? `${p.addr.slice(0, 13)}…${p.addr.slice(-6)}` : p.addr);
            const avatarUrl = profile?.avatarUrl ?? null;

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
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      border: '1px solid var(--border2)', background: 'var(--border2)',
                    }}>
                      {avatarUrl && (
                        <img
                          src={avatarUrl}
                          alt=""
                          width={20}
                          height={20}
                          style={{ objectFit: 'cover', display: 'block' }}
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <span
                      className={p.addr === "anonymous" ? "lb-anon" : "lb-addr-link"}
                      title={p.addr}
                      onClick={p.addr !== "anonymous" ? () => setProfileAddress(p.addr) : undefined}
                      style={p.addr !== "anonymous" ? { cursor: 'pointer' } : {}}
                    >
                      {displayName}
                    </span>
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
          {isViewingHistory
            ? `No data recorded for ${selectedMonth}.`
            : 'No games recorded this month. Play a game to claim your spot.'
          }
        </div>
      )}

      {/* Actions */}
      <div className="lb-actions">
        <button className="lb-action-btn" onClick={refresh}>↻ Refresh</button>
        {!isViewingHistory && (
          <button className="lb-action-btn" onClick={handleClaim} disabled={!claimReady}>◈ Claim NFT (Top 5)</button>
        )}
        {isDeployer && <button className="lb-action-btn danger" onClick={handleClear}>Clear Data</button>}
      </div>

      <div className="footer">
        {isViewingHistory
          ? `Season archive · ${selectedMonth} · NFT minted on Stacks`
          : `Points reset monthly · NFT minted on Stacks · ${new Date().getFullYear()}`
        }
      </div>

      {profileAddress && (
        <PlayerProfile
          address={profileAddress}
          walletAddr={walletAddr}
          onClose={() => setProfileAddress(null)}
        />
      )}
    </div>
  );
}
