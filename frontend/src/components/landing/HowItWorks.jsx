const STEPS = [
  { num: "01", title: "Connect Wallet", desc: "Link your Leather or Xverse wallet. Your STX address becomes your player identity on the Stacks network." },
  { num: "02", title: "Make a Move", desc: "Click a cell. A transaction is broadcast to the Clarity smart contract. The AI opponent responds instantly on-chain." },
  { num: "03", title: "Earn Points", desc: "Win = 3 pts · Draw = 1 pt · Loss = 0 pts. Points accumulate weekly. Every result is recorded permanently." },
  { num: "04", title: "Claim Trophy NFT", desc: "Top 5 players each week receive a ClarityXO Trophy NFT, minted directly to their Stacks wallet at week end." },
];
export default function HowItWorks() {
  return (
    <section className="lp-section" id="how-it-works">
      <div className="lp-section-title">How It Works</div>
      <div className="lp-steps-grid">
        {STEPS.map((step) => (
          <div className="lp-step" key={step.num}>
            <div className="lp-step-accent"></div>
            <div className="lp-step-num">{step.num}</div>
            <div className="lp-step-title">{step.title}</div>
            <div className="lp-step-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
