import React from "react";
const STEPS = [
  { num: "01", title: "Connect Wallet", time: "~30 sec", desc: "Link your Leather or Xverse wallet. Your STX address becomes your player identity on the Stacks network." },
  { num: "02", title: "Make a Move", time: "~5 sec", desc: "Click a cell. A transaction is broadcast to the Clarity smart contract. The AI opponent responds instantly on-chain." },
  { num: "03", title: "Earn Points", time: "Instant", desc: "Win = 3 pts · Draw = 1 pt · Loss = 0 pts. Points accumulate each month. Every result is recorded permanently." },
  { num: "04", title: "Claim Trophy NFT", time: "Monthly", desc: "Top 5 players each month receive a ClarityXO Trophy NFT, minted directly to their Stacks wallet at month end." },
];
export default function HowItWorks() {
  return (
    <section className="lp-section" id="how-it-works">
      <div className="lp-section-title lp-fade">How It Works</div>
      <div className="lp-wallet-badges lp-fade" aria-label="Supported wallets">
        <span className="lp-wallet-badge">Leather</span>
        <span className="lp-wallet-badge">Xverse</span>
        <span className="lp-wallet-badge-note">Stacks-compatible wallets</span>
      </div>
      <div className="lp-steps-connector" aria-hidden="true">
        {STEPS.map((_, i) => (
          <React.Fragment key={i}>
            <div className="lp-connector-dot"></div>
            {i < STEPS.length - 1 && <div className="lp-connector-line"></div>}
          </React.Fragment>
        ))}
      </div>
      <div className="lp-steps-grid">
        {STEPS.map((step) => (
          <div className="lp-step" key={step.num}>
            <div className="lp-step-watermark" aria-hidden="true">{step.num}</div>
            <div className="lp-step-accent"></div>
            <div className="lp-step-num">{step.num}</div>
            <div className="lp-step-time">{step.time}</div>
            <div className="lp-step-title">{step.title}</div>
            <div className="lp-step-desc">{step.desc}</div>
          </div>
        ))}
      </div>
      <div className="lp-hiw-avg-row lp-fade" aria-label="Average transaction timings">
        <span className="lp-hiw-avg-item"><span className="lp-hiw-avg-val">~5s</span> avg move tx</span>
        <span className="lp-hiw-avg-sep" aria-hidden="true">·</span>
        <span className="lp-hiw-avg-item"><span className="lp-hiw-avg-val">~30s</span> wallet connect</span>
        <span className="lp-hiw-avg-sep" aria-hidden="true">·</span>
        <span className="lp-hiw-avg-item"><span className="lp-hiw-avg-val">instant</span> AI response</span>
        <span className="lp-hiw-avg-sep" aria-hidden="true">·</span>
        <span className="lp-hiw-avg-item"><span className="lp-hiw-avg-val">monthly</span> NFT mint</span>
      </div>
      <div className="lp-section-link lp-fade">
        <a className="lp-section-link-a" href="#contract" onClick={(e) => { e.preventDefault(); document.getElementById("contract")?.scrollIntoView({ behavior: "smooth" }); }}>
          View the smart contract ↓
        </a>
      </div>
    </section>
  );
}
