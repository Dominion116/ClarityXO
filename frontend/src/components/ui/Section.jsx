import React from "react";

/**
 * Section — the layout + heading primitive for every landing block.
 *
 * Before, each section carried THREE separate heading mechanisms:
 *   <SectionDivider label num />  (full-width rule with a label + number)
 *   <div class="lp-section-title">…</div>
 *   sometimes an inline eyebrow too.
 * They repeated the same words ("Protocol 01" then "How It Works"), which is
 * the single biggest source of visual noise. Section folds all of that into
 * one labelled header so there is exactly one title per block.
 *
 * Props:
 *  - id:     anchor id (used by nav + scroll spy)
 *  - index:  "01".."06" — the small monospace counter (optional)
 *  - kicker: short uppercase label above the title (e.g. "Protocol")
 *  - title:  the section heading
 *  - lead:   one supporting sentence under the title (optional, keep it short)
 *  - tone:   "default" | "gold" — tints the kicker/accent for the rewards block
 *  - align:  "left" | "center"
 *  - bleed:  boolean — when true children render full-bleed (no max-width pad)
 *  - headingLevel: 2 | 3 (default 2) for correct document outline
 */
export default function Section({
  id,
  index,
  kicker,
  title,
  lead,
  tone = "default",
  align = "left",
  bleed = false,
  headingLevel = 2,
  className = "",
  children,
}) {
  const H = `h${headingLevel}`;
  const cls = [
    "cxo-section",
    `cxo-section--${tone}`,
    `cxo-section--${align}`,
    bleed && "cxo-section--bleed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cls} id={id}>
      {(kicker || title) && (
        <header className="cxo-section-head cxo-reveal">
          {(kicker || index) && (
            <p className="cxo-section-kicker">
              {kicker}
              {index && <span className="cxo-section-index" aria-hidden="true">{index}</span>}
            </p>
          )}
          {title && <H className="cxo-section-title">{title}</H>}
          {lead && <p className="cxo-section-lead">{lead}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
