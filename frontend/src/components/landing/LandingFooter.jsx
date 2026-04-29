export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-left">
        <div className="lp-footer-logo">Clarity<span>XO</span></div>
        <div className="lp-footer-links">
          <a className="lp-footer-link" href="https://stacks.co" target="_blank" rel="noopener noreferrer">Stacks</a>
          <a className="lp-footer-link" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">Contract</a>
          <a className="lp-footer-link" href="https://warpcast.com" target="_blank" rel="noopener noreferrer">Farcaster</a>
          <span className="lp-footer-link" style={{ cursor: "default" }}>Telegram</span>
        </div>
      </div>
      <div className="lp-footer-right">Built on Stacks · Clarity · {new Date().getFullYear()}</div>
    </footer>
  );
}
