import React from "react";
import { Section, Card } from "../ui";

const FEATURES = [
  { icon: "◈", title: "Immutable Game State", desc: "Every move is stored on Stacks via a Clarity contract. History can't be altered or deleted." },
  { icon: "⊞", title: "On-Chain AI Opponent", desc: "The opponent is encoded entirely in Clarity — deterministic, transparent, no servers." },
  { icon: "⚔", title: "Player vs Player", desc: "Challenge any wallet holder to a live game. PvP wins earn 5 pts vs 3 for AI — real competition, on-chain." },
  { icon: "◎", title: "Monthly Trophy NFTs", desc: "The leaderboard resets each month. The top 5 scorers earn a unique Trophy NFT." },
  { icon: "≡", title: "Live Rankings", desc: "A real-time leaderboard tracks wins, draws, losses, points and win rate, globally." },
  { icon: "⌘", title: "Predictable & Safe", desc: "Clarity is decidable by design — no reentrancy, no hidden logic, no surprises." },
  { icon: "↻", title: "Chain State Sync", desc: "One click syncs your board with the current on-chain state. Play from any device." },
];

export default function Features() {
  return (
    <Section
      id="features"
      index="02"
      kicker="Features"
      title="Built on Stacks, secured by Bitcoin"
      lead="No centralized server, a deterministic AI, and a fully auditable history — the whole game lives in an open-source Clarity contract."
    >
      <div className="cxo-feature-grid">
        {FEATURES.map((f) => (
          <Card key={f.title} className="cxo-reveal" interactive>
            <div className="cxo-feature-icon" aria-hidden="true">{f.icon}</div>
            <div className="cxo-feature-title">{f.title}</div>
            <div className="cxo-feature-desc">{f.desc}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
