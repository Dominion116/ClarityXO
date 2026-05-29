import React from "react";

/**
 * Card — a single bordered surface. Replaces the bespoke borders on
 * .lp-step / .lp-feature / .lp-nft-tier etc. so spacing + hover behaviour are
 * consistent and tunable from one place.
 *
 * Props:
 *  - tone:        "default" | "gold"
 *  - interactive: boolean — adds hover lift + pointer affordance
 *  - as:          element/tag (default "div")
 *  - index:       optional small counter rendered top-right
 */
export default function Card({
  tone = "default",
  interactive = false,
  as = "div",
  index,
  className = "",
  children,
  ...rest
}) {
  const Tag = as;
  const cls = [
    "cxo-card",
    `cxo-card--${tone}`,
    interactive && "cxo-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={cls} {...rest}>
      {index && <span className="cxo-card-index" aria-hidden="true">{index}</span>}
      {children}
    </Tag>
  );
}
