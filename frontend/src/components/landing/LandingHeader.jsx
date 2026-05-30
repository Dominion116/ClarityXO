import React, { useState, useEffect, useRef } from "react";

export default function LandingHeader({ onLaunch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [shrunk, setShrunk] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const closeMenu = (returnFocus = true) => {
    setMobileMenuOpen(false);
    if (returnFocus) hamburgerRef.current?.focus();
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const sections = ["top", "how-it-works", "features", "nft", "leaderboard", "faq"];
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
      // Close menu on scroll without stealing focus (user is interacting elsewhere)
      setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        // Outside click: don't steal focus — user clicked something else intentionally
        setMobileMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) closeMenu(true);
    };
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollTo(id); }
  };

  const handleMobileNavKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeMenu(true);
      scrollTo(id);
    }
  };

  return (
    <>
    <a href="#main-content" className="lp-skip-link">Skip to content</a>
    <header className={`lp-header${shrunk ? " lp-header--shrunk" : ""}`}>
      <div className="header-left">
        <div className="logo">Clarity<span>XO</span></div>
        <div className="lp-oss-pill" title="Open-source Clarity smart contract">OSS</div>
        <nav className="desktop-nav" aria-label="Primary">
          {[["top","Top"],["how-it-works","Protocol"],["features","Features"],["nft","Rewards"],["leaderboard","Rankings"],["faq","FAQ"]].map(([id,label]) => (
            <a key={id} role="button" tabIndex={0}
              className={`nav-item lp-nav${activeSection === id ? " active" : ""}`}
              aria-current={activeSection === id ? "true" : undefined}
              onClick={() => scrollTo(id)}
              onKeyDown={(e) => handleNavKey(e, id)}
            >{label}</a>
          ))}
        </nav>
      </div>
      <div className="header-right">
        <div className="badge" role="status" aria-label="Network status: Stacks mainnet active">
          <span className="badge-dot" aria-hidden="true"></span>
          mainnet
        </div>
        <button className="launch-btn" onClick={onLaunch}>Launch App</button>
        <button
          ref={hamburgerRef}
          className="hamburger-btn"
          onClick={() => mobileMenuOpen ? closeMenu(false) : setMobileMenuOpen(true)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="lp-scroll-bar" aria-hidden="true">
        <div className="lp-scroll-bar-fill" style={{ width: `${scrollPct}%` }}></div>
      </div>

      {/*
        role="navigation" is correct here — this is a nav overlay, not a dialog.
        aria-modal="false" was invalid (aria-modal only belongs on true modal dialogs).
      */}
      <div ref={menuRef} id="mobile-nav-menu"
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <button
          className="close-mobile-menu"
          onClick={() => closeMenu(true)}
          aria-label="Close navigation menu"
        >✕</button>
        <nav className="mobile-nav">
          {[
            ["how-it-works", "Protocol"],
            ["features",     "Features"],
            ["nft",          "Rewards"],
            ["leaderboard",  "Rankings"],
            ["faq",          "FAQ"],
          ].map(([id, label]) => (
            <a
              key={id}
              role="button"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="nav-item lp-nav mobile"
              onClick={() => { closeMenu(true); scrollTo(id); }}
              onKeyDown={(e) => handleMobileNavKey(e, id)}
            >{label}</a>
          ))}
        </nav>
      </div>
    </header>
    </>
  );
}
