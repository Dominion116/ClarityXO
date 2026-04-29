import React, { useState } from "react";

export default function LandingHeader({ onLaunch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header className="lp-header">
      <div className="header-left">
        <div className="logo">Clarity<span>XO</span></div>
        <nav className="desktop-nav">
          <a className="nav-item lp-nav" onClick={() => scrollTo("how-it-works")}>Protocol</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("features")}>Features</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("nft")}>Rewards</a>
          <a className="nav-item lp-nav" onClick={() => scrollTo("leaderboard")}>Rankings</a>
        </nav>
      </div>
      <div className="header-right">
        <div className="badge">mainnet</div>
        <button className="launch-btn" onClick={onLaunch}>Launch App</button>
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="close-mobile-menu" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">✕</button>
        <nav className="mobile-nav">
          <a className="nav-item lp-nav mobile" onClick={() => { setMobileMenuOpen(false); scrollTo("how-it-works"); }}>Protocol</a>
          <a className="nav-item lp-nav mobile" onClick={() => { setMobileMenuOpen(false); scrollTo("features"); }}>Features</a>
          <a className="nav-item lp-nav mobile" onClick={() => { setMobileMenuOpen(false); scrollTo("nft"); }}>Rewards</a>
          <a className="nav-item lp-nav mobile" onClick={() => { setMobileMenuOpen(false); scrollTo("leaderboard"); }}>Rankings</a>
        </nav>
      </div>
    </header>
  );
}
