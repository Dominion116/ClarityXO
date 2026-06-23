import React from "react";
import DemoBoard from "./DemoBoard";
import { Button, Stat, StatGroup } from "../ui";

const TRUST = ["Non-custodial", "No sign-up", "Leather & Xverse"];

export default function Hero({ onLaunch }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-grid" aria-hidden="true"></div>

      <div className="lp-hero-content cxo-reveal">
        <p className="cxo-hero-eyebrow">Stacks Mainnet · Open Source</p>

        <h1 className="cxo-hero-title">
          Tic-Tac-Toe,<br />
          <span>fully on-chain.</span>
        </h1>

        <p className="cxo-hero-sub">
          Every move is a Stacks transaction and every result is recorded
          permanently. Play solo against the AI or challenge another wallet
          holder in PvP mode. Finish the month in the top 5 to earn a Trophy NFT.
        </p>

        <div className="cxo-hero-ctas">
          <Button size="lg" onClick={onLaunch}>Play Now</Button>
          <Button variant="secondary" size="lg" onClick={() => scrollTo("how-it-works")}>
            How It Works
          </Button>
        </div>

        <p className="cxo-hero-trust" aria-label="Key guarantees">
          {TRUST.map((t) => <span key={t}>{t}</span>)}
        </p>

        <StatGroup aria-label="Game at a glance">
          <Stat value="9"  label="cells on-chain"    tone="red" />
          <Stat value="+5" label="pts · PvP win"    tone="green" />
          <Stat value="5"  label="NFT slots / month" tone="gold" />
        </StatGroup>
      </div>

      <div className="cxo-reveal">
        <DemoBoard />
      </div>
    </section>
  );
}
