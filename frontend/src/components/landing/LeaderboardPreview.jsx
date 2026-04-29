const ROWS = [
  { rank: 1, medalCls: "m1",    addr: "SP1P…3ZGM", pts: 21, w: 7,  d: 0, l: 1, wr: 87 },
  { rank: 2, medalCls: "m2",    addr: "SP1K…4ABF", pts: 16, w: 5,  d: 1, l: 2, wr: 62 },
  { rank: 3, medalCls: "m3",    addr: "SP9R…1MNQ", pts: 12, w: 4,  d: 0, l: 3, wr: 57 },
  { rank: 4, medalCls: "mgold", addr: "SP2V…8BPL", pts: 9,  w: 3,  d: 0, l: 4, wr: 42 },
  { rank: 5, medalCls: "mgold", addr: "SP3J…7CXE", pts: 7,  w: 2,  d: 1, l: 4, wr: 28 },
  { rank: 6, medalCls: "mn",    addr: "SP4L…2RTY", pts: 3,  w: 1,  d: 0, l: 5, wr: 16 },
];
export default function LeaderboardPreview() {
  return (
    <section className="lp-lb-preview" id="leaderboard">
      <div className="lp-section-title">Leaderboard Preview</div>
      <table className="lp-lb-table">
        <thead>
          <tr>
            <th style={{ width: 58 }}>Rank</th>
            <th>Player</th>
            <th style={{ width: 72 }}>Points</th>
            <th style={{ width: 64 }}>Wins</th>
            <th style={{ width: 64 }}>Draws</th>
            <th style={{ width: 64 }}>Losses</th>
            <th style={{ width: 110 }}>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.rank} className={row.rank <= 5 ? "nft-row" : ""}>
              <td><span className={`lp-lb-medal-sm ${row.medalCls}`}>{row.rank}</span></td>
              <td><span className="lp-addr-short">{row.addr}</span></td>
              <td className="pts-col">{row.pts}</td>
              <td className="win-col">{row.w}</td>
              <td className="draw-col">{row.d}</td>
              <td className="loss-col">{row.l}</td>
              <td>
                <div className="lp-wr-bar"><div className="lp-wr-fill" style={{ width: `${row.wr}%` }}></div></div>
                <span className="lp-wr-pct">{row.wr}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
