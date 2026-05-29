import React from "react";

/**
 * Badge — small status pill. Replaces the scattered .badge / .lp-oss-pill /
 * .lp-proof-chip / .lp-wallet-badge / .lp-key-benefit / .lp-feature-chip
 * variations, which all did the same thing with slightly different CSS.
 *
 * Props:
 *  - variant: "default" | "success" | "gold" | "danger" | "outline"
 *  - dot:     boolean — leading status dot (animated for "success")
 *  - size:    "sm" | "md"
 */
export default function Badge({
  variant = "default",
  dot = false,
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "cxo-badge",
    `cxo-badge--${variant}`,
    `cxo-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} {...rest}>
      {dot && <span className="cxo-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
