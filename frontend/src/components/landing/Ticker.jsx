import React from "react";
const ITEMS = [
  { color: "g", text: "SP30V…7Z3Y played [1,1]", result: "Win", pts: "+3 pts" },
  { color: "gold", text: "SP1KF…4ABF played [0,2]", result: "Draw", pts: "+1 pt" },
  { color: "r", text: "SP3J8…7CXE played [2,0]", result: "Loss", pts: "+0 pts" },
  { color: "g", text: "TX broadcast: 0x7f2b… confirmed", result: null, pts: null },
  { color: "gold", text: "NFT Trophy minted → rank #2 · W08", result: null, pts: null },
  { color: "g", text: "SP9R1…1MNQ played [0,0]", result: "Win", pts: "+3 pts" },
  { color: "g", text: "New weekly record: 47 wins", result: null, pts: null },
  { color: "gold", text: "SP2V8…8BPL qualifies for NFT drop", result: null, pts: null },
];
export default function Ticker() {
  const all = [...ITEMS, ...ITEMS];
  return (
    <div className="lp-ticker" role="marquee" aria-label="Live game feed">
      <p className="sr-only">
        Live on-chain activity: recent game results include wins (+3 pts), draws (+1 pt), and
        NFT trophy mints to qualifying players. All moves are Stacks blockchain transactions.
      </p>
      <div className="lp-ticker-label" aria-hidden="true">
        <span className="lp-ticker-pulse"></span>
        Live
      </div>
      <div className="lp-ticker-track">
        {all.map((item, i) => (
          <div key={i} className="lp-ticker-item" role="listitem">
            <span className={`lp-ticker-dot ${item.color}`}></span>
            {item.text}
            {item.result && (
              <span className={`lp-ticker-result ${item.result.toLowerCase()}`}>{item.result}</span>
            )}
            {item.pts && <span className="lp-ticker-pts">{item.pts}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
