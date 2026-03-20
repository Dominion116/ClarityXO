// ── Keyframes injected once ───────────────────────────────────────────────
export const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');

@keyframes drawLine {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0; }
}
@keyframes drawCircle {
  from { stroke-dashoffset: 87.96; }
  to   { stroke-dashoffset: 0; }
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a0a; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #222; }
`;

export const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#e8e0d0",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0",
  },
  header: {
    width: "100%",
    borderBottom: "1px solid #2a2a2a",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "13px",
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: "#e8e0d0",
  },
  logoAccent: { color: "#ff4444" },
  networkBadge: {
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    border: "1px solid #2a2a2a",
    padding: "4px 10px",
    borderRadius: "0",
    color: "#666",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    width: "100%",
    maxWidth: "460px",
    boxSizing: "border-box",
    gap: "0",
  },
  title: {
    fontSize: "11px",
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    color: "#444",
    marginBottom: "32px",
  },
  statusBar: {
    width: "100%",
    borderTop: "1px solid #1e1e1e",
    borderLeft: "1px solid #1e1e1e",
    borderRight: "1px solid #1e1e1e",
    padding: "12px 16px",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  statusDot: (active, color) => ({
    width: "6px",
    height: "6px",
    borderRadius: "0",
    background: active ? color : "#333",
    display: "inline-block",
    marginRight: "8px",
    transition: "background 0.2s",
  }),
  boardWrap: {
    width: "100%",
    border: "1px solid #2a2a2a",
    position: "relative",
    aspectRatio: "1 / 1",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr 1fr",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  cell: (state, isWin, isProcessing) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: state === 0 && !isProcessing ? "crosshair" : "default",
    borderRight: "1px solid #1e1e1e",
    borderBottom: "1px solid #1e1e1e",
    background: isWin ? "#111" : "transparent",
    transition: "background 0.15s",
    userSelect: "none",
  }),
  infoRow: {
    width: "100%",
    borderBottom: "1px solid #1e1e1e",
    borderLeft: "1px solid #1e1e1e",
    borderRight: "1px solid #1e1e1e",
    display: "flex",
    boxSizing: "border-box",
  },
  infoCell: (highlight) => ({
    flex: 1,
    padding: "10px 16px",
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: highlight ? "#e8e0d0" : "#444",
    borderRight: "1px solid #1e1e1e",
    boxSizing: "border-box",
  }),
  btnRow: {
    width: "100%",
    display: "flex",
    gap: "0",
    marginTop: "0",
    border: "1px solid #2a2a2a",
    borderTop: "none",
    boxSizing: "border-box",
  },
  btn: (variant) => ({
    flex: 1,
    padding: "14px",
    fontSize: "10px",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "none",
    borderRadius: "0",
    background: variant === "primary" ? "#ff4444" : "#111",
    color: variant === "primary" ? "#fff" : "#666",
    borderRight: "1px solid #1e1e1e",
    transition: "background 0.15s, color 0.15s",
    fontFamily: "inherit",
  }),
  log: {
    width: "100%",
    marginTop: "24px",
    border: "1px solid #1a1a1a",
    boxSizing: "border-box",
    maxHeight: "120px",
    overflowY: "auto",
  },
  logLine: (type) => ({
    padding: "6px 14px",
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: type === "error" ? "#ff4444" : type === "success" ? "#44bb88" : "#555",
    borderBottom: "1px solid #111",
    fontFamily: "inherit",
  }),
  walletBar: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    color: "#444",
    border: "1px solid #1a1a1a",
    borderBottom: "none",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  connectBtn: {
    padding: "6px 14px",
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    border: "1px solid #333",
    background: "transparent",
    color: "#e8e0d0",
    cursor: "pointer",
    borderRadius: "0",
    fontFamily: "inherit",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(10,10,10,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  overlayText: {
    fontSize: "10px",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "#555",
  },
};
