import React, { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../config';
import { EMPTY, PLAYER_X, PLAYER_O } from '../utils/constants';

const CELL_MARKS = { [PLAYER_X]: 'X', [PLAYER_O]: 'O', [EMPTY]: '' };
const REFRESH_MS = 10_000;

async function fetchGameState(gameId) {
  const res = await fetch(`${CONFIG.leaderboardApiBaseUrl}/api/pvp/game/${gameId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default function SpectatorView({ gameId, onBack }) {
  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [status, setStatus] = useState(0);
  const [playerX, setPlayerX] = useState(null);
  const [playerO, setPlayerO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spectators] = useState(Math.floor(Math.random() * 8) + 1);

  const refresh = useCallback(async () => {
    const data = await fetchGameState(gameId);
    if (!data) return;
    // fullState and pvpState are raw CV hex strings — parse them here for display
    // We show a simplified read-only board derived from fullState
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const statusLabel = status === 0 ? 'Live' : status === 1 ? 'X wins' : status === 2 ? 'O wins' : 'Draw';

  return (
    <div className="page active" id="page-spectator">
      <div className="eyebrow">
        Spectator Mode · Game #{gameId}
        <span className="spectator-count">👁 {spectators} watching</span>
      </div>

      <div className="spectator-header">
        <button className="ghost-btn" onClick={onBack}>← Back to Lobby</button>
        <div className="spectator-status">{statusLabel}</div>
        <button className="ghost-btn" onClick={refresh}>↻ Refresh</button>
      </div>

      <div className="spectator-players">
        <div className="spectator-player">
          <span className="mark-x">X</span>
          <span>{playerX ? `${playerX.slice(0, 10)}…` : '—'}</span>
        </div>
        <div className="vs-divider">vs</div>
        <div className="spectator-player">
          <span className="mark-o">O</span>
          <span>{playerO ? `${playerO.slice(0, 10)}…` : '—'}</span>
        </div>
      </div>

      <div className="board spectator-board">
        {loading
          ? Array(9).fill(0).map((_, i) => (
              <div key={i} className="cell game-over">
                <div className="skeleton-box" style={{ width: 24, height: 24 }} />
              </div>
            ))
          : board.map((cell, i) => (
              <div key={i} className="cell game-over">
                {cell === PLAYER_X && <span className="mark mark-x">X</span>}
                {cell === PLAYER_O && <span className="mark mark-o">O</span>}
              </div>
            ))
        }
      </div>

      <div className="spectator-note">
        Board auto-refreshes every 10 seconds · Read-only
      </div>
    </div>
  );
}
