export default function FinalCTA({ onLaunch }) {
  return (
    <div className="lp-final-cta">
      <div className="lp-final-eyebrow">Ready to play?</div>
      <div className="lp-final-title">Your move is<br />a <span>transaction.</span></div>
      <div className="lp-final-sub">Connect your wallet. Make history on-chain.</div>
      <div className="lp-final-btns">
        <button className="lp-cta-primary lp-cta-lg" onClick={onLaunch}>Launch ClarityXO</button>
        <a className="lp-cta-secondary lp-cta-lg" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">View Contract ↗</a>
      </div>
    </div>
  );
}
