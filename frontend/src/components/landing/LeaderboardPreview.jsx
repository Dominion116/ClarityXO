import React from "react";
import { Section, Button } from "../ui";

const ROWS = [
  { rank: 1, medalCls: "m1",    addr: "SP1P…3ZGM", pts: 21, w: 7,  d: 0, l: 1, wr: 87, delta: "+3" },
  { rank: 2, medalCls: "m2",    addr: "SP1K…4ABF", pts: 16, w: 5,  d: 1, l: 2, wr: 62, delta: "+1" },
  { rank: 3, medalCls: "m3",    addr: "SP9R…1MNQ", pts: 12, w: 4,  d: 0, l: 3, wr: 57, delta: "+3" },
  { rank: 4, medalCls: "mgold", addr: "SP2V…8BPL", pts: 9,  w: 3,  d: 0, l: 4, wr: 42, delta: "0"  },
  { rank: 5, medalCls: "mgold", addr: "SP3J…7CXE", pts: 7,  w: 2,  d: 1, l: 4, wr: 28, delta: "+1" },
  { rank: 6, medalCls: "mn",    addr: "SP4L…2RTY", pts: 3,  w: 1,  d: 0, l: 5, wr: 16, delta: "0"  },
];
export default function LeaderboardPreview({ onLaunch }) {
  return (
    <Section
      id="leaderboard"
      index="04"
      kicker="Rankings"
      title="Live monthly leaderboard"
      lead="Win = 3 pts · Draw = 1 pt · Loss = 0 pts. The top 5 at month end qualify for a Trophy NFT."
    >
      <table className="lp-lb-table" aria-label="Monthly leaderboard preview — top 6 players by points">
        <caption className="sr-only">Monthly leaderboard preview. Top 5 players qualify for Trophy NFT. Rankings reset at month end.</caption>
        <colgroup>
          <col style={{ width: 58 }} />
          <col />
          <col style={{ width: 72 }} />
          <col style={{ width: 64 }} />
          <col style={{ width: 64 }} />
          <col style={{ width: 64 }} />
          <col style={{ width: 110 }} />
        </colgroup>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Points</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.rank} className={[
              row.rank <= 5 ? "nft-row" : "",
              row.rank === 1 ? "top-1" : row.rank === 2 ? "top-2" : row.rank === 3 ? "top-3" : ""
            ].filter(Boolean).join(" ")}>
              <td><span className={`lp-lb-medal-sm ${row.medalCls}`}>{row.rank}</span></td>
              <td><span className="lp-addr-short">{row.addr}</span></td>
              <td className="pts-col">
                {row.pts}
                <span className={`lp-pts-delta ${row.delta === "0" ? "neutral" : "up"}`} aria-label={`Last game: ${row.delta} points`}>
                  {row.delta === "0" ? "—" : `▲${row.delta}`}
                </span>
              </td>
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
      <div className="lp-lb-cta-row cxo-reveal">
        <Button variant="secondary" size="sm" onClick={() => onLaunch?.()}>
          See full leaderboard →
        </Button>
      </div>
    </Section>
  );
}
