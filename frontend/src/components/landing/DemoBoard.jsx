import React, { useEffect, useState, useRef } from "react";

const STATES = [
  { board: [0,0,0, 0,0,0, 0,0,0], label: "New game · Move 0 of 9", winLine: null },
  { board: [1,0,0, 0,2,0, 0,0,0], label: "Move 2 of 9 · Your turn",  winLine: null },
  { board: [1,0,0, 0,2,0, 1,0,0], label: "Move 4 of 9 · Your turn",  winLine: null },
  { board: [1,0,2, 0,2,0, 1,0,0], label: "Move 4 of 9 · Your turn",  winLine: null },
  { board: [1,0,2, 0,2,0, 1,1,0], label: "Move 6 of 9 · Your turn",  winLine: null },
  { board: [1,2,2, 0,2,0, 1,1,0], label: "Move 7 of 9 · Your turn",  winLine: null },
  { board: [1,2,2, 1,2,0, 1,1,0], label: "You win! +3 pts · X wins",  winLine: [0,3,6] },
];

function XMark({ win }) {
  const color = win ? "#44bb88" : "#ff4444";
  return (
    <svg className="lp-mark" width="36" height="36" viewBox="0 0 44 44" fill="none" overflow="visible">
      <line x1="10" y1="10" x2="34" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      <line x1="34" y1="10" x2="10" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  );
}

function OMark() {
  return (
    <svg className="lp-mark" width="36" height="36" viewBox="0 0 44 44" fill="none" overflow="visible">
      <circle cx="22" cy="22" r="13" stroke="#e8e0d0" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export default function DemoBoard() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fast, setFast] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const timerRef = useRef(null);

  const startTimer = (interval = 1800) => {
    clearInterval(timerRef.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % STATES.length);
    }, interval);
  };

  useEffect(() => {
    if (playing) startTimer(fast ? 700 : 1800);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, fast]);

  const state = STATES[idx];

  const WIN_LINES = {
    "0,1,2": { top: "16.67%", left: "5%",  width: "90%", height: "2px", transform: "none" },
    "3,4,5": { top: "50%",    left: "5%",  width: "90%", height: "2px", transform: "translateY(-50%)" },
    "6,7,8": { top: "83.33%", left: "5%",  width: "90%", height: "2px", transform: "translateY(-100%)" },
    "0,3,6": { top: "5%",     left: "16.67%", width: "2px", height: "90%", transform: "translateX(-50%)" },
    "1,4,7": { top: "5%",     left: "50%",    width: "2px", height: "90%", transform: "translateX(-50%)" },
    "2,5,8": { top: "5%",     left: "83.33%", width: "2px", height: "90%", transform: "translateX(-50%)" },
    "0,4,8": { top: "5%",     left: "5%",  width: "128%", height: "2px", transform: "rotate(45deg)", transformOrigin: "top left" },
    "2,4,6": { top: "5%",     right: "5%", width: "128%", height: "2px", transform: "rotate(135deg)", transformOrigin: "top right" },
  };
  const winKey = state.winLine ? state.winLine.join(",") : null;
  const winStyle = winKey ? WIN_LINES[winKey] : null;

  return (
    <div className="lp-board-wrap" role="region" aria-label="Animated demo of an on-chain tic-tac-toe game on Stacks mainnet"
      onMouseEnter={() => { if (playing) setPlaying(false); }}
      onMouseLeave={() => setPlaying(true)}>
      <div className="lp-board-label">live game state · stacks mainnet</div>
      <div className="lp-board-controls">
        <button className="lp-board-btn" aria-label="Previous step"
          onClick={() => { setPlaying(false); setIdx(i => (i - 1 + STATES.length) % STATES.length); }}>‹</button>
        <button className="lp-board-btn" onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause demo" : "Play demo"}>
          {playing ? "⏸" : "▶"}
        </button>
        <button className="lp-board-btn" aria-label="Next step"
          onClick={() => { setPlaying(false); setIdx(i => (i + 1) % STATES.length); }}>›</button>
        <button
          className={`lp-board-btn${fast ? " active" : ""}`}
          onClick={() => setFast(f => !f)}
          aria-label={fast ? "Switch to normal speed (1×)" : "Switch to fast speed (2×)"}
          aria-pressed={fast}
        >
          {fast ? "1×" : "2×"}
        </button>
      </div>
      <div className="lp-demo-board">
        <div className="lp-board-corner-tl"></div>
        <div className="lp-board-corner-br"></div>
        {winStyle && (
          <div className="lp-win-line" style={winStyle} aria-hidden="true"></div>
        )}
        {state.board.map((cell, i) => {
          const isWin = state.winLine?.includes(i);
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <div key={i} className={`lp-demo-cell${isWin ? " win-cell" : ""}`}
              onMouseEnter={() => setHoverCell([row, col])}
              onMouseLeave={() => setHoverCell(null)}>
              {cell === 1 && <XMark win={isWin} />}
              {cell === 2 && <OMark />}
            </div>
          );
        })}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{state.label}</div>
      <div className="lp-board-meta">
        <div className="lp-board-meta-item"><span className="mark-x">X</span> · You</div>
        <div className="lp-board-meta-item"><span className="mark-o">O</span> · Contract</div>
        <div className="lp-board-meta-item lp-board-coords" aria-live="off">
          {hoverCell ? `[${hoverCell[0]},${hoverCell[1]}]` : state.label}
        </div>
      </div>
    </div>
  );
}
