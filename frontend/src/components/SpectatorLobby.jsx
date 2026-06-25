import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config';
import SpectatorView from './SpectatorView';

async function fetchLiveGames() {
  try {
    const res = await fetch(`${CONFIG.leaderboardApiBaseUrl}/api/pvp/live`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.games) ? data.games : [];
  } catch {
    return [];
  }
}

export default function SpectatorLobby({ navigate }) {
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spectatingId, setSpectatingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchLiveGames().then(setLiveGames).finally(() => setLoading(false));
  }, []);

  if (spectatingId) {
    return <SpectatorView gameId={spectatingId} onBack={() => setSpectatingId(null)} />;
  }

  return (
    <div className="page active" id="page-spectator-lobby">
      <div className="lb-header">
        <div className="lb-header-left">
          <div className="lb-title">Spectator Lobby</div>
          <div className="lb-week">{liveGames.length} live game{liveGames.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="lb-header-right">
          <button className="lb-action-btn" onClick={() => navigate('pvp')}>← PvP Lobby</button>
        </div>
      </div>

      {loading ? (
        <div className="spectator-lobby-list">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="spectator-lobby-row skeleton-box" style={{ height: 48 }} />
          ))}
        </div>
      ) : liveGames.length === 0 ? (
        <div className="lb-empty">No live PvP games right now. Check back soon.</div>
      ) : (
        <div className="spectator-lobby-list">
          {liveGames.map((g) => (
            <div key={g.gameId} className="spectator-lobby-row">
              <div className="spectator-lobby-info">
                <span className="spectator-game-id">Game #{g.gameId}</span>
                <span className="spectator-player-addr">{g.player ? `${g.player.slice(0, 12)}…` : '—'}</span>
                <span className="spectator-moves">{g.moves} moves</span>
              </div>
              <button className="ghost-btn" onClick={() => setSpectatingId(g.gameId)}>
                Watch →
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        Spectator mode · Read-only · Auto-refreshes every 10s
      </div>
    </div>
  );
}
