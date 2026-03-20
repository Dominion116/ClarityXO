import React, { useState, useEffect } from 'react';
import { loadLB, getPlayerList, clearLeaderboardData, claimNFT, getMonthEnd, formatCountdown } from '../utils/leaderboardLogic';

export default function Leaderboard({ walletAddr, addLog, navigate }) {
  const [data, setData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState("—");

  const refresh = () => {
    const d = loadLB();
    setData(d);
    setPlayers(getPlayerList(d));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      const ms = getMonthEnd() - Date.now();
      setCountdown(formatCountdown(ms));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (clearLeaderboardData()) refresh();
  };

  const handleClaim = () => {
    claimNFT(walletAddr, addLog);
    navigate('game'); // Original app navigated back to game upon claim click
  };

  if (!data) return null;

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
          {players.map((p, i) => {
            const rank = i + 1;
            const nftZone = rank <= 5;
            const isMe = walletAddr ? p.addr === walletAddr : p.addr === "anonymous";
            const winRate = p.games > 0 ? Math.round((p.wins / p.games) * 100) : 0;

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
                      <div className="wr-fill" style={{ width: `${winRate}%` }}></div>
                    </div>
                    <div className="wr-pct">{winRate}%</div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {players.length === 0 && (
        <div className="lb-empty" id="lb-empty">
          No games recorded this month.<br />Play a game to claim your spot.
        </div>
      )}

      {/* Actions */}
      <div className="lb-actions">
        <button className="lb-action-btn" onClick={refresh}>↻ Refresh</button>
        <button className="lb-action-btn" onClick={handleClaim}>◈ Claim NFT (Top 5)</button>
        <button className="lb-action-btn danger" onClick={handleClear}>Clear Data</button>
      </div>

      <div className="footer">
        Points reset monthly · NFT minted on Stacks · <span className="yr">{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
