const LINKS = [
  { label: "Contract", href: "https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y?chain=mainnet" },
  { label: "GitHub ↗", href: "https://github.com/Dominion116/ClarityXO" },
  { label: "Stacks", href: "https://stacks.co" },
  { label: "Farcaster", href: "https://warpcast.com" },
];

export default function LandingFooter() {
  const scrollTop = () => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="cxo-footer">
      <div className="cxo-footer-main">
        <div className="cxo-footer-brand">Clarity<span>XO</span></div>
        <nav className="cxo-footer-links" aria-label="Footer">
          {LINKS.map((l) => (
            <a key={l.label} className="cxo-footer-link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
          <button type="button" className="cxo-footer-link" onClick={scrollTop} aria-label="Back to top" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)" }}>
            ↑ Top
          </button>
        </nav>
      </div>
      <div className="cxo-footer-bar">
        <span>Built on Stacks · Clarity v2 · {new Date().getFullYear()}</span>
        <span>v1.0.0 · Open Source · No financial advice</span>
      </div>
    </footer>
  );
}
