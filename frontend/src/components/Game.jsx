import React, { useRef, useEffect } from 'react';
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from '../utils/constants';
import { CONFIG } from '../config';

export default function Game({
  board,
  status,
  moveCount,
  processing,
  walletAddr,
  logs,
  newCells,
  winLine,
  syncChainState,
  connectWallet,
  makeMove,
  resetLocal,
  resign
}) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const getStatusInfo = () => {
    if (processing) return { label: "broadcasting…", color: "var(--muted)", dotActive: false };
    if (status === STATUS_X_WON) return { label: "you win", color: "var(--green)", dotActive: false };
    if (status === STATUS_O_WON) return { label: "computer wins", color: "var(--red)", dotActive: false };
    if (status === STATUS_DRAW) return { label: "draw", color: "var(--text)", dotActive: false };
    return { label: "your move", color: "var(--muted)", dotActive: true };
  };

  const statusInfo = getStatusInfo();
  const gameOver = status !== STATUS_ACTIVE;

  const handleCellClick = (idx) => {
    makeMove(idx);
  };

  return (
    <div className="page active" id="page-game">
      <div className="eyebrow">Stacks Blockchain · Tic-Tac-Toe</div>

      <div className="wallet-bar">
        <span id="wallet-addr">{walletAddr ? `${walletAddr.slice(0, 16)}…` : "no wallet connected"}</span>
        <div className="wallet-bar-btns">
          {!walletAddr && (
            <button className="ghost-btn" id="btn-connect" onClick={connectWallet}>
              Connect
            </button>
          )}
          <button className="ghost-btn" id="btn-sync" onClick={syncChainState}>
            Sync Chain
          </button>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <span className={`dot ${statusInfo.dotActive ? 'active' : ''}`} id="status-dot"></span>
          <span id="status-label" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        </div>
        <span className="move-count">move <span id="move-count">{moveCount}</span></span>
      </div>

      <div className="board" id="board">
        {processing && <div className="board-overlay" id="board-overlay">waiting…</div>}
        {board.map((cell, idx) => {
          const isWinCell = winLine && winLine.includes(idx);
          const drawAnimate = newCells.has(idx);

          let cellClass = "cell";
          if (cell !== EMPTY) cellClass += " occupied";
          if (gameOver) cellClass += " game-over";
          if (isWinCell) cellClass += " win-cell";

          return (
            <div key={idx} className={cellClass} onClick={() => handleCellClick(idx)}>
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
        <div className="info-cell"><span className="mark-x">X</span> · You</div>
        <div className="info-cell"><span className="mark-o">O</span> · Computer</div>
        <div className="info-cell" id="info-empty">Cells left: {board.filter(c => c === EMPTY).length}</div>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" id="btn-new" onClick={resetLocal}>New Game</button>
        <button className="btn btn-secondary" id="btn-resign" onClick={resign}>Resign</button>
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

      <div className="footer">ClarityXO · Stacks · <span className="yr">{new Date().getFullYear()}</span></div>
    </div>
  );
}
