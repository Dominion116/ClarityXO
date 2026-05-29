import React from "react";

/**
 * Button — the single CTA primitive for the landing page.
 *
 * Replaces the ad-hoc .lp-cta-primary / .lp-cta-secondary / .lp-cta-ghost /
 * .launch-btn classes that were duplicated across sections. One component,
 * one set of focus/hover states, consistent sizing.
 *
 * Props:
 *  - variant: "primary" | "secondary" | "ghost"   (default "primary")
 *  - size:    "sm" | "md" | "lg"                   (default "md")
 *  - as:      "button" | "a"                        (default "button")
 *  - block:   boolean — full-width on its row
 *  - loading: boolean — shows a spinner + disables the control
 *  - All native button/anchor props pass through (onClick, href, target…).
 *
 * When `as="a"` and an `href` is external, pass target/rel as usual.
 */
const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    as = "button",
    block = false,
    loading = false,
    disabled = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const Tag = as;
  const cls = [
    "cxo-btn",
    `cxo-btn--${variant}`,
    `cxo-btn--${size}`,
    block && "cxo-btn--block",
    loading && "is-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // For <a>, there is no `disabled` attribute — guard with aria + class.
  const isDisabled = disabled || loading;
  const tagProps =
    Tag === "button"
      ? { type: rest.type || "button", disabled: isDisabled }
      : { "aria-disabled": isDisabled || undefined };

  return (
    <Tag ref={ref} className={cls} {...tagProps} {...rest}>
      {loading && <span className="cxo-btn-spinner" aria-hidden="true" />}
      <span className="cxo-btn-label">{children}</span>
    </Tag>
  );
});

export default Button;
