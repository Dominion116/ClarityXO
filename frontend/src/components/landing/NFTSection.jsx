import React, { useState, useEffect } from "react";

function useMonthCountdown() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const lastDay = new Date(Date.UTC(year, month + 1, 0));
      const end = new Date(Date.UTC(year, month, lastDay.getUTCDate(), 23, 59, 0));
      const diff = end - now;
      if (diff <= 0) { setTime("00:00:00"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) {
        setTime(`${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m`);
      } else {
        setTime(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const TIERS = [
  { cls: "t1",  label: "1",   name: "Gold Trophy",    sub: "Most points · Month champion", hint: "≥ 1st place" },
  { cls: "t2",  label: "2",   name: "Silver Trophy",  sub: "Runner-up · Top 2",           hint: "2nd place" },
  { cls: "t3",  label: "3",   name: "Bronze Trophy",  sub: "Third place · Top 3",         hint: "3rd place" },
  { cls: "t45", label: "4–5", name: "Qualifier NFT",  sub: "Top 5 · Participation badge", hint: "4th–5th place" },
];
export default function NFTSection() {
  const countdown = useMonthCountdown();
  return (
    <section className="lp-nft-section" id="nft">
      <div className="lp-section-title">Monthly Trophy System</div>
      <div className="lp-nft-main">
        <div className="lp-nft-main-content">
          <div className="lp-nft-tag">◈  NFT Prize · Stacks Blockchain</div>
          <div className="lp-nft-countdown">
            <span className="lp-nft-countdown-label">Resets in</span>
            <span className="lp-nft-countdown-timer" aria-live="off">{countdown}</span>
          </div>
          <div className="lp-nft-main-title">Earn a Trophy.<br />Every month, five wallets win.</div>
          <div className="lp-nft-rarity-bar" aria-label="Trophy rarity distribution">
            <div className="lp-nft-rarity-seg gold" style={{ flex: 1 }} title="Gold — 1st place (20%)"></div>
            <div className="lp-nft-rarity-seg silver" style={{ flex: 1 }} title="Silver — 2nd place (20%)"></div>
            <div className="lp-nft-rarity-seg bronze" style={{ flex: 1 }} title="Bronze — 3rd place (20%)"></div>
            <div className="lp-nft-rarity-seg qualifier" style={{ flex: 2 }} title="Qualifier — 4th–5th place (40%)"></div>
          </div>
          <div className="lp-nft-rarity-labels" aria-hidden="true">
            <span>Gold</span><span>Silver</span><span>Bronze</span><span>Qualifier ×2</span>
          </div>
          <div className="lp-nft-main-desc">
            The leaderboard resets at the end of each calendar month. The top 5 players by points
            automatically qualify for a ClarityXO Trophy NFT, minted directly to their Stacks
            address. Points don't carry — every month is a fresh competition.
          </div>
          <div className="lp-nft-schedule" aria-label="Monthly reset schedule">
            <span className="lp-nft-schedule-item">◷ Resets: <strong>last day of month 23:59 UTC</strong></span>
            <span className="lp-nft-schedule-sep" aria-hidden="true">·</span>
            <span className="lp-nft-schedule-item">Points: <strong>do not carry over</strong></span>
          </div>
          <ul className="lp-nft-rules" aria-label="NFT eligibility rules">
            <li>Play at least one game during the month</li>
            <li>Finish in the top 5 by total points at reset time</li>
            <li>Hold a Stacks wallet at the time of minting</li>
            <li>No staking or lock-up required — trophies are freely tradable</li>
          </ul>
          <a className="lp-nft-contract-link" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">
            View Trophy Contract ↗
          </a>
          <a className="lp-nft-faq-link" href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>
            Common questions about NFTs ↓
          </a>
          <div className="lp-nft-tiers">
            {TIERS.map((t) => (
              <div className="lp-nft-tier" key={t.label}>
                <div className={`lp-tier-medal ${t.cls}`}>{t.label}</div>
                <div className="lp-tier-info">
                <strong>{t.name}</strong>
                {t.sub}
                <span className="lp-tier-hint">{t.hint}</span>
              </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-nft-visual">
          <div className="lp-nft-card">
            <div className="lp-nft-card-inner">
              <div className="lp-nft-card-symbol">◈</div>
              <div className="lp-nft-card-name">ClarityXO</div>
              <div className="lp-nft-card-sub">Trophy · M01 · Rank #1</div>
            </div>
          </div>
          <div className="lp-nft-badge">Stacks NFT</div>
        </div>
      </div>
    </section>
  );
}
