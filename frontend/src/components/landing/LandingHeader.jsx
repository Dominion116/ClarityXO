export default function LandingHeader({ onLaunch }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header className="lp-header">
      <div className="header-left">
        <div className="logo">Clarity<span>XO</span></div>
        <nav>
          <a className="nav-item lp-nav" onClick={() => scrollTo("how-it-works")}>Protocol</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("features")}>Features</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("nft")}>Rewards</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("leaderboard")}>Rankings</a>
        </nav>
      </div>
      <div className="header-right">
        <div className="badge">mainnet</div>
        <button className="launch-btn" onClick={onLaunch}>Launch App</button>
      </div>
    </header>
  );
}
