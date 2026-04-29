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
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % STATES.length);
    }, 1800);
    return () => clearInterval(timerRef.current);
  }, []);

  const state = STATES[idx];

  return (
    <div className="lp-board-wrap">
      <div className="lp-board-label">live game state · stacks mainnet</div>
      <div className="lp-demo-board">
        <div className="lp-board-corner-tl"></div>
        <div className="lp-board-corner-br"></div>
        {state.board.map((cell, i) => {
          const isWin = state.winLine?.includes(i);
          return (
            <div key={i} className={`lp-demo-cell${isWin ? " win-cell" : ""}`}>
              {cell === 1 && <XMark win={isWin} />}
              {cell === 2 && <OMark />}
            </div>
          );
        })}
      </div>
      <div className="lp-board-meta">
        <div className="lp-board-meta-item"><span className="mark-x">X</span> · You</div>
        <div className="lp-board-meta-item"><span className="mark-o">O</span> · Contract</div>
        <div className="lp-board-meta-item">{state.label}</div>
      </div>
    </div>
  );
}
