import React from "react";
import { Button } from "../ui";

const contractHref =
  "https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet";

export default function FinalCTA({ onLaunch }) {
  return (
    <section className="cxo-section cxo-section--center cxo-final cxo-reveal">
      <p className="cxo-hero-eyebrow" style={{ justifyContent: "center" }}>Ready to play?</p>
      <h2 className="cxo-final-title">
        Your move is<br />a <span>transaction.</span>
      </h2>
      <p className="cxo-final-sub">Connect your wallet and make history on-chain.</p>

      <div className="cxo-final-ctas">
        <Button size="lg" onClick={onLaunch}>Launch ClarityXO</Button>
        <Button as="a" variant="secondary" size="lg" href={contractHref} target="_blank" rel="noopener noreferrer">
          View Contract ↗
        </Button>
      </div>

      <p className="cxo-final-note">
        ClarityXO never requests seed phrases or private keys. Every move is signed
        directly by your wallet.
      </p>
    </section>
  );
}
