import React, { useState } from "react";

const ITEMS = [
  {
    q: "Do I need to pay to play?",
    a: "Each move costs a small Stacks transaction fee (typically &lt;0.01 STX). There are no platform fees. Draws cost nothing — only moves that change the board state are broadcast.",
  },
  {
    q: "How does the AI opponent work?",
    a: "The AI is encoded directly in the Clarity smart contract. It runs on-chain — no server, no off-chain process. The logic is deterministic and fully auditable on the Stacks blockchain.",
  },
  {
    q: "How do I claim a Trophy NFT?",
    a: "You don't need to do anything. If you finish in the top 5 at the end of the month, the trophy is minted automatically to your Stacks wallet address after the month resets.",
  },
  {
    q: "Are NFTs tradable?",
    a: "Yes. ClarityXO Trophy NFTs are standard SIP-009 NFTs on the Stacks network. They are freely tradable on any Stacks NFT marketplace.",
  },
  {
    q: "What wallets are supported?",
    a: "Leather (formerly Hiro Wallet) and Xverse are the two primary supported wallets. Any Stacks-compatible wallet that can sign transactions should work.",
  },
  {
    q: "Is the contract open source?",
    a: "Yes. The Clarity contract is deployed on Stacks mainnet and the code is publicly readable on the Hiro Explorer. No build step needed — Clarity is its own audit.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="lp-faq" id="faq">
      <div className="lp-section-title lp-fade">FAQ</div>
      <div className="lp-faq-list">
        {ITEMS.map((item, i) => (
          <div className="lp-faq-item" key={i}>
            <button
              className={`lp-faq-q${open === i ? " open" : ""}`}
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <span className="lp-faq-chevron" aria-hidden="true">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="lp-faq-a open"
                dangerouslySetInnerHTML={{ __html: item.a }}>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
