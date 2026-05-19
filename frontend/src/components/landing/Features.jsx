const FEATURES = [
  { icon: "◈  On-Chain", tag: "Blockchain", title: "Immutable Game State", desc: "Every move is stored on the Stacks blockchain via a Clarity smart contract. Game history cannot be altered or deleted." },
  { icon: "⊞  AI Opponent", tag: "Gameplay", title: "Smart Contract AI", desc: "The computer opponent is encoded entirely in Clarity — deterministic, transparent logic. No hidden algorithms, no servers." },
  { icon: "◎  Weekly Rewards", tag: "Incentives", title: "Trophy NFT System", desc: "Weekly leaderboard resets every Sunday. Top 5 scorers earn a unique ClarityXO Trophy NFT minted to their wallet." },
  { icon: "≡  Leaderboard", tag: "Competition", title: "Live Rankings", desc: "Real-time leaderboard tracks wins, draws, losses, points, and win rate. Compete against players globally." },
  { icon: "⌘  Clarity Contract", tag: "Security", title: "Predictable & Safe", desc: "Written in Clarity — a decidable language that prevents entire classes of bugs. No reentrancy, no surprises." },
  { icon: "↻  Sync Chain", tag: "UX", title: "Chain State Sync", desc: "One click syncs your local board with the current on-chain state. Play from any device, any time." },
];
export default function Features() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-section-title lp-fade">Built on Stacks</div>
      <div className="lp-features-grid">
        {FEATURES.map((f) => (
          <div className="lp-feature" key={f.title}>
            <div className="lp-feature-tag">{f.tag}</div>
            <div className="lp-feature-icon">{f.icon}</div>
            <div className="lp-feature-title">{f.title}</div>
            <div className="lp-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
