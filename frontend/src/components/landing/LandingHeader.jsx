import React, { useState, useEffect, useRef } from "react";

export default function LandingHeader({ onLaunch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [shrunk, setShrunk] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const sections = ["top", "how-it-works", "features", "nft", "leaderboard"];
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(100, Math.max(0, pct)));
      setShrunk(el.scrollTop > 40);

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
  const handleNavKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollTo(id); }
  };
  return (
    <header className={`lp-header${shrunk ? " lp-header--shrunk" : ""}`}>
      <div className="header-left">
        <div className="logo">Clarity<span>XO</span></div>
        <nav className="desktop-nav">
          {[["top","Top"],["how-it-works","Protocol"],["features","Features"],["nft","Rewards"],["leaderboard","Rankings"]].map(([id,label]) => (
            <a key={id} role="button" tabIndex={0}
              className={`nav-item lp-nav${activeSection === id ? " active" : ""}`}
              onClick={() => scrollTo(id)}
              onKeyDown={(e) => handleNavKey(e, id)}
            >{label}</a>
          ))}
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
