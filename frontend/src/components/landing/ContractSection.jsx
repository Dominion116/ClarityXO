import React, { useState } from "react";
import { CONFIG } from "../../config";

function useCopyToast() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

export default function ContractSection() {
  const [copied, copy] = useCopyToast();
  return (
    <section className="lp-contract-section" id="contract">
      <div className="lp-section-title lp-fade">Smart Contract</div>
      <div className="lp-contract-grid">
        <div className="lp-contract-left">
          <div className="lp-contract-label">Contract Address · Stacks Mainnet</div>
          <div className="lp-contract-addr-row">
            <div className="lp-contract-addr"><span>{CONFIG.contractAddress}</span><br />.{CONFIG.contractName}</div>
            <button className="lp-copy-btn" onClick={() => copy(`${CONFIG.contractAddress}.${CONFIG.contractName}`)} aria-label="Copy contract address">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          {copied && <div className="lp-copy-toast" role="status">Address copied to clipboard</div>}
          <div className="lp-contract-label">NFT Trophy Contract</div>
          <div className="lp-contract-addr" style={{ fontSize: "10px", color: "var(--muted)" }}>
            {CONFIG.nftContractAddress}<br />.{CONFIG.nftContractName}
          </div>
          <div className="lp-network-indicators">
            <div className="lp-net-indicator"><span className="lp-net-dot live"></span>Mainnet Active</div>
            <div className="lp-net-indicator"><span className="lp-net-dot off"></span>Devnet Off</div>
          </div>
        </div>
        <div className="lp-contract-right">
          <div className="lp-contract-label">Public Functions</div>
          <div className="lp-code-block">
            <span className="code-comment">{`;; ClarityXO — Tic-Tac-Toe on Stacks`}</span>
            {"\n\n"}
            <span className="code-kw">(define-public</span> (<span className="code-fn">make-move</span>
            {"\n  "}(row <span className="code-num">uint</span>) (col <span className="code-num">uint</span>))
            {"\n  "}{`;; Broadcasts your move + AI response`}{"\n)\n\n"}
            <span className="code-kw">(define-public</span> (<span className="code-fn">resign-game</span>)
            {"\n  "}{`;; Forfeit current game`}{"\n)\n\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-board-state</span>))
            {"\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-game-status</span>))
            {"\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-moves-count</span>))
          </div>
        </div>
      </div>
    </section>
  );
}
