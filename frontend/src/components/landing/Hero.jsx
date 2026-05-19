import DemoBoard from "./DemoBoard";
export default function Hero({ onLaunch }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-content">
        <div className="lp-hero-eyebrow fade-up d1">Stacks Mainnet · Open-Source · Clarity Contract</div>
        <div className="lp-proof-chips fade-up d2">
          <span className="lp-proof-chip">✓ Deployed on Stacks Mainnet</span>
          <span className="lp-proof-chip">✓ Fully on-chain AI</span>
          <span className="lp-proof-chip">✓ Weekly NFT prizes</span>
        </div>
        <h1 className="lp-hero-h1 fade-up d2">
          Tic-Tac-Toe<br /><span>on-chain.</span><br />Forever.
        </h1>
        <p className="lp-hero-sub fade-up d3">
          Every move is a blockchain transaction. Every win is recorded permanently.
          Compete for weekly NFT trophies on the Stacks network.
        </p>
        <p className="lp-hero-subcopy fade-up d3">
          Leaderboard resets every Sunday · Top 5 earn a Trophy NFT · No gas for draws
        </p>
        <div className="lp-hero-ctas fade-up d4">
          <button className="lp-cta-primary" onClick={onLaunch}>Play Now</button>
          <button className="lp-cta-secondary" onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <a className="lp-cta-ghost" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">View Contract ↗</a>
        </div>
        <div className="lp-hero-stats fade-up d5">
          <div className="lp-hero-stat">
            <div className="lp-stat-val red">9</div>
            <div className="lp-stat-label">Cells on-chain</div>
            <div className="lp-stat-hint">every move a tx</div>
          </div>
          <div className="lp-hero-stat">
            <div className="lp-stat-val green">+3</div>
            <div className="lp-stat-label">pts per win</div>
            <div className="lp-stat-hint">draw +1 · loss 0</div>
          </div>
          <div className="lp-hero-stat">
            <div className="lp-stat-val gold">5</div>
            <div className="lp-stat-label">NFT slots/week</div>
            <div className="lp-stat-hint">top 5 by points</div>
          </div>
        </div>
      </div>
      <div className="fade-up d6"><DemoBoard /></div>
      <div className="lp-scroll-hint fade-up d6" onClick={() => scrollTo("how-it-works")} aria-label="Scroll to Protocol section">
        <span className="lp-scroll-hint-arrow">↓</span>
        <span className="lp-scroll-hint-label">scroll</span>
      </div>
    </section>
  );
}
