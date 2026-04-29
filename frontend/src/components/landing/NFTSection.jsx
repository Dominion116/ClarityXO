const TIERS = [
  { cls: "t1", label: "1",   name: "Gold Trophy",    sub: "Most points · Week champion" },
  { cls: "t2", label: "2",   name: "Silver Trophy",  sub: "Runner-up · Top 2" },
  { cls: "t3", label: "3",   name: "Bronze Trophy",  sub: "Third place · Top 3" },
  { cls: "t45", label: "4–5", name: "Qualifier NFT", sub: "Top 5 · Participation badge" },
];
export default function NFTSection() {
  return (
    <section className="lp-nft-section" id="nft">
      <div className="lp-section-title">Weekly Trophy System</div>
      <div className="lp-nft-main">
        <div className="lp-nft-main-content">
          <div className="lp-nft-tag">◈  NFT Prize · Stacks Blockchain</div>
          <div className="lp-nft-main-title">Earn a Trophy.<br />Every week, five wallets win.</div>
          <div className="lp-nft-main-desc">
            The leaderboard resets every Sunday at 23:59 UTC. The top 5 players by points
            automatically qualify for a ClarityXO Trophy NFT, minted directly to their Stacks
            address. Points don't carry — every week is a fresh competition.
          </div>
          <div className="lp-nft-tiers">
            {TIERS.map((t) => (
              <div className="lp-nft-tier" key={t.label}>
                <div className={`lp-tier-medal ${t.cls}`}>{t.label}</div>
                <div className="lp-tier-info"><strong>{t.name}</strong>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-nft-visual">
          <div className="lp-nft-card">
            <div className="lp-nft-card-inner">
              <div className="lp-nft-card-symbol">◈</div>
              <div className="lp-nft-card-name">ClarityXO</div>
              <div className="lp-nft-card-sub">Trophy · W08 · Rank #1</div>
            </div>
          </div>
          <div className="lp-nft-badge">Stacks NFT</div>
        </div>
      </div>
    </section>
  );
}
