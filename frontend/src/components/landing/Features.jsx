const FEATURES = [
  { icon: "◈  On-Chain", tag: "Blockchain", title: "Immutable Game State", desc: "Every move is stored on the Stacks blockchain via a Clarity smart contract. Game history cannot be altered or deleted.", chips: ["On-chain", "Permanent"] },
  { icon: "⊞  AI Opponent", tag: "Gameplay", title: "Smart Contract AI", desc: "The computer opponent is encoded entirely in Clarity — deterministic, transparent logic. No hidden algorithms, no servers.", chips: ["AI", "Deterministic"] },
  { icon: "◎  Weekly Rewards", tag: "Incentives", title: "Trophy NFT System", desc: "Weekly leaderboard resets every Sunday. Top 5 scorers earn a unique ClarityXO Trophy NFT minted to their wallet.", chips: ["NFT", "Rewards"] },
  { icon: "≡  Leaderboard", tag: "Competition", title: "Live Rankings", desc: "Real-time leaderboard tracks wins, draws, losses, points, and win rate. Compete against players globally.", chips: ["Live", "Global"] },
  { icon: "⌘  Clarity Contract", tag: "Security", title: "Predictable & Safe", desc: "Written in Clarity — a decidable language that prevents entire classes of bugs. No reentrancy, no surprises.", chips: ["Clarity", "Safe"] },
  { icon: "↻  Sync Chain", tag: "UX", title: "Chain State Sync", desc: "One click syncs your local board with the current on-chain state. Play from any device, any time.", chips: ["Sync", "UX"] },
];
export default function Features() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-section-title lp-fade">Built on Stacks</div>
      <div className="lp-quick-facts lp-fade">
        <span className="lp-quick-fact">Written in <strong>Clarity</strong> — a decidable smart contract language</span>
        <span className="lp-quick-fact-sep" aria-hidden="true">·</span>
        <span className="lp-quick-fact">Secured by <strong>Stacks</strong> and <strong>Bitcoin</strong> finality</span>
        <span className="lp-quick-fact-sep" aria-hidden="true">·</span>
        <span className="lp-quick-fact"><strong>Open-source</strong> — read the contract on-chain</span>
      </div>
      <div className="lp-key-benefits lp-fade">
        <span className="lp-key-benefit">⊛ No centralized server</span>
        <span className="lp-key-benefit">⊛ Deterministic AI</span>
        <span className="lp-key-benefit">⊛ Fully auditable history</span>
        <span className="lp-key-benefit">⊛ Self-sovereign rewards</span>
      </div>
      <div className="lp-features-grid">
        {FEATURES.map((f, i) => (
          <div className="lp-feature" key={f.title}>
            <div className="lp-feature-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
            <div className="lp-feature-tag">{f.tag}</div>
            <div className="lp-feature-icon">{f.icon}</div>
            <div className="lp-feature-title">{f.title}</div>
            <div className="lp-feature-desc">{f.desc}</div>
            <div className="lp-feature-chips" aria-hidden="true">
              {f.chips.map(c => <span className="lp-feature-chip" key={c}>{c}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
