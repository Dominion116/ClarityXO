const ITEMS = [
  { color: "g", text: "SP30V…7Z3Y played [1,1] · Win · +3 pts" },
  { color: "gold", text: "SP1KF…4ABF played [0,2] · Draw · +1 pt" },
  { color: "r", text: "SP3J8…7CXE played [2,0] · Loss · +0 pts" },
  { color: "g", text: "TX broadcast: 0x7f2b… confirmed" },
  { color: "gold", text: "NFT Trophy minted → rank #2 · W08" },
  { color: "g", text: "SP9R1…1MNQ played [0,0] · Win · +3 pts" },
  { color: "g", text: "New weekly record: 47 wins" },
  { color: "gold", text: "SP2V8…8BPL qualifies for NFT drop" },
];
export default function Ticker() {
  const all = [...ITEMS, ...ITEMS];
  return (
    <div className="lp-ticker">
      <div className="lp-ticker-track">
        {all.map((item, i) => (
          <div key={i} className="lp-ticker-item">
            <span className={`lp-ticker-dot ${item.color}`}></span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
