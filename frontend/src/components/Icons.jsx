import React from 'react';

// X mark SVG
export function XMark({ size = 44, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none"
      style={{ overflow: "visible" }}>
      <line x1="8" y1="8" x2="36" y2="36" stroke="#ff4444" strokeWidth="2.5"
        strokeLinecap="square"
        style={animated ? {
          strokeDasharray: 40,
          strokeDashoffset: 0,
          animation: "drawLine 0.18s ease-out forwards",
        } : {}} />
      <line x1="36" y1="8" x2="8" y2="36" stroke="#ff4444" strokeWidth="2.5"
        strokeLinecap="square"
        style={animated ? {
          strokeDasharray: 40,
          strokeDashoffset: 0,
          animation: "drawLine 0.18s 0.05s ease-out forwards",
        } : {}} />
    </svg>
  );
}

// O mark SVG
export function OMark({ size = 44, animated = false }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none"
      style={{ overflow: "visible" }}>
      <circle cx="22" cy="22" r={r} stroke="#e8e0d0" strokeWidth="2.5"
        fill="none"
        style={animated ? {
          strokeDasharray: circ,
          strokeDashoffset: circ,
          animation: `drawCircle 0.22s ease-out forwards`,
        } : {}} />
    </svg>
  );
}
