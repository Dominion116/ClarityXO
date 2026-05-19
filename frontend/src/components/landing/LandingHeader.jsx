import React, { useState, useEffect, useRef } from "react";

export default function LandingHeader({ onLaunch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const menuRef = useRef(null);

  useEffect(() => {
    const sections = ["top", "how-it-works", "features", "nft", "leaderboard"];
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(100, Math.max(0, pct)));

      let current = "top";
      for (const id of sections) {
        const sec = document.getElementById(id);
        if (sec && sec.getBoundingClientRect().top <= 80) current = id;
      }
      setActiveSection(current);
      setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [mobileMenuOpen]);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header className="lp-header">
      <div className="header-left">
        <div className="logo">Clarity<span>XO</span></div>
        <nav className="desktop-nav">
          <a className={`nav-item lp-nav${activeSection === "top" ? " active" : ""}`} onClick={() => scrollTo("top")}>Top</a>
          <a className={`nav-item lp-nav${activeSection === "how-it-works" ? " active" : ""}`} onClick={() => scrollTo("how-it-works")}>Protocol</a>
          <a className={`nav-item lp-nav${activeSection === "features" ? " active" : ""}`} onClick={() => scrollTo("features")}>Features</a>
          <a className={`nav-item lp-nav${activeSection === "nft" ? " active" : ""}`} onClick={() => scrollTo("nft")}>Rewards</a>
          <a className={`nav-item lp-nav${activeSection === "leaderboard" ? " active" : ""}`} onClick={() => scrollTo("leaderboard")}>Rankings</a>
        </nav>
      </div>
      <div className="header-right">
        <div className="badge" role="status" aria-label="Network status: mainnet active">
          <span className="badge-dot" aria-hidden="true"></span>
          mainnet
        </div>
        <button className="launch-btn" onClick={onLaunch}>Launch App</button>
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="lp-scroll-bar" aria-hidden="true">
        <div className="lp-scroll-bar-fill" style={{ width: `${scrollPct}%` }}></div>
      </div>

      <div ref={menuRef} className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
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
