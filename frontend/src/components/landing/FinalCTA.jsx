const TRUST_BADGES = [
  { icon: "⊛", label: "Open Source" },
  { icon: "◈", label: "Stacks Mainnet" },
  { icon: "⌘", label: "Clarity Contract" },
  { icon: "◎", label: "Weekly NFT Prizes" },
];

export default function FinalCTA({ onLaunch }) {
  return (
    <div className="lp-final-cta">
      <div className="lp-final-eyebrow">Ready to play?</div>
      <div className="lp-final-title">Your move is<br />a <span>transaction.</span></div>
      <div className="lp-final-sub">Connect your wallet. Make history on-chain.</div>
      <div className="lp-trust-badges">
        {TRUST_BADGES.map((b) => (
          <div className="lp-trust-badge" key={b.label}>
            <span className="lp-trust-badge-icon">{b.icon}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
      <div className="lp-final-stat-strip" aria-label="Protocol statistics">
        <div className="lp-final-stat">
          <div className="lp-final-stat-val">9</div>
          <div className="lp-final-stat-label">cells per board</div>
        </div>
        <div className="lp-final-stat-sep" aria-hidden="true"></div>
        <div className="lp-final-stat">
          <div className="lp-final-stat-val">~5s</div>
          <div className="lp-final-stat-label">avg move finality</div>
        </div>
        <div className="lp-final-stat-sep" aria-hidden="true"></div>
        <div className="lp-final-stat">
          <div className="lp-final-stat-val">&lt;0.01 STX</div>
          <div className="lp-final-stat-label">avg tx fee</div>
        </div>
      </div>
      <div className="lp-final-btns">
        <button className="lp-cta-primary lp-cta-lg" onClick={onLaunch}>Launch ClarityXO</button>
        <a className="lp-cta-secondary lp-cta-lg" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">View Contract ↗</a>
      </div>
      <a className="lp-final-protocol-link" href="#contract" onClick={(e) => { e.preventDefault(); document.getElementById("contract")?.scrollIntoView({ behavior: "smooth" }); }}>
        Protocol details ↑
      </a>
      <p className="lp-final-wallet-note">
        ClarityXO never requests seed phrases or private keys. All moves are signed directly by your wallet.
      </p>
      <div className="lp-final-faq-prompt">
        Questions? <a className="lp-final-faq-link" href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>See the FAQ ↓</a>
      </div>
    </div>
  );
}
