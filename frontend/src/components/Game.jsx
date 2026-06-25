import React, { useState, useRef, useEffect } from 'react';
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW, GAME_MODE_PVP } from '../utils/constants';
import { resolveAddressName } from '../utils/bns';
import { fetchPlayerProfile } from '../utils/profile';
import { formatTime } from '../utils/gameLogic';
import { CONFIG } from '../config';
import StatsStrip from './StatsStrip';
import ShareButton from './ShareButton';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useSoundEffects } from '../hooks/useSoundEffects';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function Game({
  board,
  status,
  moveCount,
  processing,
  walletAddr,
  logs,
  newCells,
  winLine,
  gameTime,
  moveHistory,
  historyStep,
  onStepBack,
  onStepForward,
  onExitReplay,
  difficulty,
  onDifficultyChange,
  syncChainState,
  connectWallet,
  startGame,
  makeMove,
  resetLocal,
  resign,
  gameMode,
  pvpOpponent,
  pvpTurn,
  makePvPMoveHandler,
}) {
  const logRef = useRef(null);
  const [bnsName, setBnsName] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const { stats: playerStats, loading: statsLoading } = usePlayerStats(walletAddr);
  const { isMuted, toggleMute, playClick, playWin, playLoss, playDraw } = useSoundEffects();
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === STATUS_ACTIVE && status !== STATUS_ACTIVE) {
      if (status === STATUS_X_WON) playWin();
      else if (status === STATUS_O_WON) playLoss();
      else if (status === STATUS_DRAW) playDraw();
    }
  }, [status, playWin, playLoss, playDraw]);

  useEffect(() => {
    setBnsName(null);
    setPlayerProfile(null);
    if (!walletAddr) return;
    resolveAddressName(walletAddr).then(setBnsName);
    fetchPlayerProfile(walletAddr).then(setPlayerProfile);
  }, [walletAddr]);

  const getStatusInfo = () => {
    if (processing) return { label: "broadcasting…", color: "var(--muted)", dotActive: false };
    if (status === STATUS_X_WON) return { label: gameMode === GAME_MODE_PVP ? "X wins" : "you win", color: "var(--green)", dotActive: false };
    if (status === STATUS_O_WON) return { label: gameMode === GAME_MODE_PVP ? "O wins" : "computer wins", color: "var(--red)", dotActive: false };
    if (status === STATUS_DRAW) return { label: "draw", color: "var(--text)", dotActive: false };
    if (gameMode === GAME_MODE_PVP) {
      const isMyTurn = (pvpTurn === PLAYER_X && walletAddr) || pvpTurn === PLAYER_X;
      return { label: pvpTurn === PLAYER_X ? "X's turn" : "O's turn", color: "var(--muted)", dotActive: true };
    }
    return { label: "your move", color: "var(--muted)", dotActive: true };
  };

  const statusInfo = getStatusInfo();
  const gameOver = status !== STATUS_ACTIVE;
  const isReplaying = historyStep !== null;
  const displayBoard = isReplaying ? moveHistory[historyStep].boardAfter : board;

  const handleCellClick = (idx) => {
    playClick();
    if (gameMode === GAME_MODE_PVP && makePvPMoveHandler) {
      makePvPMoveHandler(idx);
    } else {
      makeMove(idx);
    }
  };

  return (
    <div className="page active" id="page-game">
      <div className="eyebrow">
        Stacks Blockchain · Tic-Tac-Toe
        {gameMode === GAME_MODE_PVP && (
          <span className="pvp-mode-badge">PvP</span>
        )}
      </div>

      <div className="wallet-bar">
        {walletAddr ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border2)', background: 'var(--border2)',
            }}>
              {playerProfile?.avatarUrl && (
                <img
                  src={playerProfile.avatarUrl}
                  alt=""
                  width={18}
                  height={18}
                  style={{ objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
            <span id="wallet-addr" title={walletAddr}>
              {playerProfile?.name ?? bnsName ?? `${walletAddr.slice(0, 16)}…`}
            </span>
          </div>
        ) : (
          <span id="wallet-addr">no wallet connected</span>
        )}
        <div className="wallet-bar-btns">
          {!walletAddr && (
            <button className="ghost-btn" id="btn-connect" onClick={connectWallet}>
              Connect
            </button>
          )}
          <button className="ghost-btn" id="btn-sync" onClick={syncChainState}>
            Sync Chain
          </button>
          <button
            className="ghost-btn mute-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {walletAddr && (
        <StatsStrip stats={playerStats} loading={statsLoading} />
      )}

      {gameMode === GAME_MODE_PVP && pvpOpponent && (
        <div className="pvp-opponent-bar">
          <span className="pvp-opponent-label">vs</span>
          <span className="pvp-opponent-addr">{pvpOpponent.slice(0, 14)}…</span>
        </div>
      )}

      <div className="status-bar">
        <div className="status-left">
          <span className={`dot ${statusInfo.dotActive ? 'active' : ''}`} id="status-dot"></span>
          <span id="status-label" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        </div>
        <span className="move-count">move <span id="move-count">{moveCount}</span></span>
        <span className="game-timer" id="game-timer">{formatTime(gameTime)}</span>
      </div>

      <div className="board" id="board">
        {processing && <div className="board-overlay" id="board-overlay">waiting…</div>}
        {displayBoard.map((cell, idx) => {
          const isWinCell = !isReplaying && winLine && winLine.includes(idx);
          const drawAnimate = !isReplaying && newCells.has(idx);

          let cellClass = "cell";
          if (cell !== EMPTY) cellClass += " occupied";
          if (gameOver || isReplaying) cellClass += " game-over";
          if (isWinCell) cellClass += " win-cell";

          return (
            <div key={idx} className={cellClass} onClick={() => !isReplaying && handleCellClick(idx)}>
              {cell === PLAYER_X && (
                <svg className="mark" width="40" height="40" viewBox="-20 -20 40 40">
                  <line x1="-14" y1="-14" x2="14" y2="14" className={`x-line1 ${drawAnimate ? 'animate' : 'static'}`} />
                  <line x1="14" y1="-14" x2="-14" y2="14" className={`x-line2 ${drawAnimate ? 'animate' : 'static'}`} />
                </svg>
              )}
              {cell === PLAYER_O && (
                <svg className="mark" width="40" height="40" viewBox="-20 -20 40 40">
                  <circle cx="0" cy="0" r="14" className={`o-circle ${drawAnimate ? 'animate' : 'static'}`} />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      <div className="info-row">
        <div className="info-cell"><span className="mark-x">X</span> · {gameMode === GAME_MODE_PVP ? 'Challenger' : 'You'}</div>
        <div className="info-cell"><span className="mark-o">O</span> · {gameMode === GAME_MODE_PVP ? 'Opponent' : 'Computer'}</div>
        <div className="info-cell" id="info-empty">Cells left: {displayBoard.filter(c => c === EMPTY).length}</div>
      </div>

      <div className="difficulty-row">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            className={`difficulty-btn ${d} ${difficulty === d ? 'active' : ''}`}
            onClick={() => onDifficultyChange(d)}
            disabled={processing}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" id="btn-new" onClick={resetLocal} disabled={processing || !walletAddr}>New Game</button>
        <button className="btn btn-secondary" id="btn-resign" onClick={resign} disabled={processing || !walletAddr || gameOver}>Resign</button>
        {gameOver && (
          <ShareButton
            outcome={status === STATUS_X_WON ? 'win' : status === STATUS_O_WON ? 'loss' : 'draw'}
            bnsName={bnsName}
            gameMode={gameMode}
          />
        )}
      </div>

      <div className="contract-info" id="contract-info">
        {CONFIG.contractAddress}.{CONFIG.contractName}
      </div>

      <div className="log-wrap">
        <div className="log-title">Event Log</div>
        <div className="log" id="log" ref={logRef}>
          <div className="log-line info">Ready. Click a cell to play.</div>
          {logs.map((L, i) => (
            <div key={i} className={`log-line ${L.type}`}>{L.msg}</div>
          ))}
        </div>
      </div>

      {moveHistory.length > 0 && (
        <div className="history-wrap">
          <div className="history-header">
            <span className="history-title">Move History</span>
            <div className="history-controls">
              <button className="replay-btn" onClick={onStepBack} disabled={historyStep === 0}>‹</button>
              <button className="replay-btn" onClick={onStepForward} disabled={historyStep === null}>›</button>
              {historyStep !== null && (
                <button className="replay-btn replay-live" onClick={onExitReplay}>live</button>
              )}
            </div>
          </div>
          <div className="history-list" id="history-list">
            {moveHistory.map((entry, i) => (
              <div key={i} className={`history-entry${historyStep === i ? ' active' : ''}`}>
                <span className={`history-player mark-${entry.player.toLowerCase()}`}>{entry.player}</span>
                <span className="history-coord">{entry.coord}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="footer">ClarityXO · Stacks · <span className="yr">{new Date().getFullYear()}</span></div>
    </div>
  );
}
