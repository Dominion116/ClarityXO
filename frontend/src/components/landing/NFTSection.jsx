import React, { useState, useEffect } from "react";
import { Section, Card, Button, Badge } from "../ui";
import { CONFIG } from "../../config";

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
      setTime(
        d > 0
          ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
          : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const RULES = [
  "Play at least one game during the month",
  "Finish top 5 by total points when the month resets",
  "Trophies mint automatically — nothing to claim",
  "Standard SIP-009 NFTs, freely tradable",
];

const explorerHref = `https://explorer.hiro.so/address/${CONFIG.nftContractAddress}?chain=mainnet`;

export default function NFTSection() {
  const countdown = useMonthCountdown();

  return (
    <Section
      id="nft"
      index="03"
      kicker="Rewards"
      tone="gold"
      title="Five wallets win a Trophy every month"
    >
      <div className="cxo-nft">
        <div className="cxo-reveal">
          <div className="cxo-countdown">
            <span className="cxo-countdown-label">Resets in</span>
            <span className="cxo-countdown-time" aria-live="off">{countdown || "—"}</span>
          </div>
          <p className="cxo-nft-desc">
            The leaderboard resets at the end of each calendar month (23:59 UTC).
            The top 5 players by points qualify for a ClarityXO Trophy NFT, minted
            directly to their Stacks address. Points don't carry over — every month
            is a fresh competition.
          </p>
          <ul className="cxo-nft-rules" aria-label="Eligibility">
            {RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <Button as="a" variant="secondary" size="sm" href={explorerHref} target="_blank" rel="noopener noreferrer">
            View Trophy Contract ↗
          </Button>
        </div>

        <Card tone="gold" className="cxo-reveal" style={{ textAlign: "center", padding: "var(--sp-7)" }}>
          <div style={{ fontSize: 40, color: "var(--gold)", marginBottom: "var(--sp-3)" }}>◈</div>
          <div className="cxo-nft-title" style={{ margin: "0 0 var(--sp-2)" }}>ClarityXO Trophy</div>
          <Badge variant="gold" size="sm">Stacks NFT · SIP-009</Badge>
        </Card>
      </div>
    </Section>
  );
}
