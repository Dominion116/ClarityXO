import DemoBoard from "./DemoBoard";
export default function Hero({ onLaunch }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="lp-hero">
      <div className="lp-hero-content">
        <div className="lp-hero-eyebrow fade-up d1">Stacks Blockchain · Clarity Smart Contract</div>
        <h1 className="lp-hero-h1 fade-up d2">
          Tic-Tac-Toe<br /><span>on-chain.</span><br />Forever.
        </h1>
        <p className="lp-hero-sub fade-up d3">
          Every move is a blockchain transaction. Every win is recorded permanently.
          Compete for weekly NFT trophies on the Stacks network.
        </p>
        <div className="lp-hero-ctas fade-up d4">
          <button className="lp-cta-primary" onClick={onLaunch}>Play Now</button>
          <button className="lp-cta-secondary" onClick={() => scrollTo("how-it-works")}>How It Works</button>
        </div>
        <div className="lp-hero-stats fade-up d5">
          <div className="lp-hero-stat"><div className="lp-stat-val red">9</div><div className="lp-stat-label">Cells on-chain</div></div>
          <div className="lp-hero-stat"><div className="lp-stat-val green">+3</div><div className="lp-stat-label">pts per win</div></div>
          <div className="lp-hero-stat"><div className="lp-stat-val gold">5</div><div className="lp-stat-label">NFT slots/week</div></div>
        </div>
      </div>
      <div className="fade-up d6"><DemoBoard /></div>
    </section>
  );
}
