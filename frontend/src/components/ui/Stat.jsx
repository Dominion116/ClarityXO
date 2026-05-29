import React from "react";

/**
 * Stat + StatGroup — the numeric strips used in the hero and final CTA.
 *
 * The originals (.lp-hero-stat, .lp-final-stat) each carried a glyph, a value,
 * a label AND a hint — four lines per stat. Stat keeps value + label by default
 * and treats the hint as optional, so the strip reads in one glance.
 *
 * <StatGroup>
 *   <Stat value="9"  label="cells on-chain" tone="red"   />
 *   <Stat value="+3" label="points per win" tone="green" />
 *   <Stat value="5"  label="NFT slots / month" tone="gold" />
 * </StatGroup>
 */
export function Stat({ value, label, tone = "default", hint, className = "" }) {
  const cls = ["cxo-stat", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className={`cxo-stat-value cxo-stat-value--${tone}`}>{value}</div>
      <div className="cxo-stat-label">{label}</div>
      {hint && <div className="cxo-stat-hint">{hint}</div>}
    </div>
  );
}

export function StatGroup({ columns, className = "", children, ...rest }) {
  const cls = ["cxo-stat-group", className].filter(Boolean).join(" ");
  const style = columns ? { "--cxo-stat-cols": columns } : undefined;
  return (
    <div className={cls} style={style} role="list" {...rest}>
      {React.Children.map(children, (child) =>
        child ? <div role="listitem" className="cxo-stat-cell">{child}</div> : null
      )}
    </div>
  );
}

export default Stat;
