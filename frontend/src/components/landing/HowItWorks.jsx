import React from "react";
import { Section, Card } from "../ui";

const STEPS = [
  { num: "01", title: "Connect Wallet", desc: "Link Leather or Xverse. Your STX address becomes your player identity." },
  { num: "02", title: "Make a Move", desc: "Click a cell to broadcast a transaction. The on-chain AI responds instantly." },
  { num: "03", title: "Earn Points", desc: "Win +3, draw +1, loss +0. Every result is recorded permanently." },
  { num: "04", title: "Claim Trophy", desc: "The top 5 each month receive a Trophy NFT, minted straight to their wallet." },
];

export default function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      index="01"
      kicker="Protocol"
      title="Four steps from wallet to trophy"
    >
      <div className="cxo-steps">
        {STEPS.map((step) => (
          <Card key={step.num} className="cxo-reveal" interactive>
            <div className="cxo-step-num">{step.num}</div>
            <div className="cxo-step-title">{step.title}</div>
            <div className="cxo-step-desc">{step.desc}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
