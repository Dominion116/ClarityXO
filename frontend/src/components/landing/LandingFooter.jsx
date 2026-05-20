const SOCIALS = [
  { label: "Farcaster", href: "https://warpcast.com", icon: "⌘" },
  { label: "Discord", href: "#", icon: "◈" },
  { label: "GitHub", href: "https://github.com/Dominion116/ClarityXO", icon: "⊛" },
];

export default function LandingFooter() {
  const scrollTop = () => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="lp-footer">
      <div className="lp-footer-left">
        <div className="lp-footer-logo">Clarity<span>XO</span></div>
        <div className="lp-footer-links">
          <a className="lp-footer-link" href="https://stacks.co" target="_blank" rel="noopener noreferrer">Stacks</a>
          <a className="lp-footer-link" href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" target="_blank" rel="noopener noreferrer">Contract</a>
          <a className="lp-footer-link" href="https://github.com/Dominion116/ClarityXO" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a className="lp-footer-link" href="https://warpcast.com" target="_blank" rel="noopener noreferrer">Farcaster</a>
          <span className="lp-footer-link" style={{ cursor: "default" }}>Telegram</span>
        </div>
      </div>
      <div className="lp-footer-right">
        Built on Stacks · Clarity · {new Date().getFullYear()}
        <button className="lp-back-to-top" onClick={scrollTop} aria-label="Back to top">↑ Top</button>
      </div>
      <div className="lp-footer-socials">
        {SOCIALS.map(s => (
          <a key={s.label} className="lp-footer-social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
            <span className="lp-footer-social-icon" aria-hidden="true">{s.icon}</span>
            {s.label}
          </a>
        ))}
      </div>
      <div className="lp-footer-legal">
        <span className="lp-footer-legal-item">No financial advice · Play at your own risk</span>
        <span className="lp-footer-legal-sep" aria-hidden="true">·</span>
        <a className="lp-footer-legal-link" href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>Terms</a>
        <span className="lp-footer-legal-sep" aria-hidden="true">·</span>
        <a className="lp-footer-legal-link" href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>Privacy</a>
      </div>
    </footer>
  );
}
