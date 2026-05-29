import React, { useState } from "react";
import { CONFIG } from "../../config";
import { Section, Button } from "../ui";

function useCopyToast() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

const explorerHref = `https://explorer.hiro.so/address/${CONFIG.contractAddress}.${CONFIG.contractName}?chain=mainnet`;

export default function ContractSection() {
  const [copied, copy] = useCopyToast();
  const [nftCopied, copyNft] = useCopyToast();
  const [expanded, setExpanded] = useState(false);

  return (
    <Section
      id="contract"
      index="05"
      kicker="On-chain"
      title="Read the contract yourself"
      lead="The full game and trophy logic is deployed on Stacks mainnet and publicly readable — Clarity is its own audit."
    >
      <div className="cxo-contract">
        <div className="lp-contract-left cxo-reveal" style={{ border: "1px solid var(--border2)", borderRadius: "var(--cxo-radius)" }}>
          <div className="lp-contract-label">Game Contract · Stacks Mainnet</div>
          <div className="lp-contract-addr-row">
            <div className="lp-contract-addr"><span>{CONFIG.contractAddress}</span><br />.{CONFIG.contractName}</div>
            <button className="lp-copy-btn" onClick={() => copy(`${CONFIG.contractAddress}.${CONFIG.contractName}`)} aria-label="Copy game contract address">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div className="lp-contract-label">Trophy NFT Contract</div>
          <div className="lp-contract-addr-row">
            <div className="lp-contract-addr" style={{ fontSize: "10px", color: "var(--text-2)" }}>
              {CONFIG.nftContractAddress}<br />.{CONFIG.nftContractName}
            </div>
            <button className="lp-copy-btn" onClick={() => copyNft(`${CONFIG.nftContractAddress}.${CONFIG.nftContractName}`)} aria-label="Copy NFT contract address">
              {nftCopied ? "✓" : "Copy"}
            </button>
          </div>

          <div aria-live="polite" className="sr-only">
            {copied ? "Game address copied to clipboard" : nftCopied ? "NFT address copied to clipboard" : ""}
          </div>

          <Button as="a" variant="secondary" size="sm" href={explorerHref} target="_blank" rel="noopener noreferrer">
            View in Explorer ↗
          </Button>
        </div>

        <div className="lp-contract-right cxo-reveal" style={{ border: "1px solid var(--border2)", borderRadius: "var(--cxo-radius)" }}>
          <div className="lp-contract-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Public Functions</span>
            <button className="lp-code-toggle" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
              {expanded ? "Collapse ↑" : "Expand ↓"}
            </button>
          </div>
          <div className={`lp-code-block${expanded ? " expanded" : " collapsed"}`}>
            <span className="code-comment">{`;; ClarityXO — Tic-Tac-Toe on Stacks`}</span>
            {"\n\n"}
            <span className="code-kw">(define-public</span> (<span className="code-fn">make-move</span>
            {"\n  "}(row <span className="code-num">uint</span>) (col <span className="code-num">uint</span>))
            {"\n  "}{`;; Broadcasts your move + AI response`}{"\n)\n\n"}
            <span className="code-kw">(define-public</span> (<span className="code-fn">resign-game</span>)
            {"\n  "}{`;; Forfeit current game`}{"\n)\n\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-game-board</span>))
            {"\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-game-status</span>))
            {"\n"}
            <span className="code-kw">(define-read-only</span> (<span className="code-fn">get-game-moves</span>))
          </div>
        </div>
      </div>
    </Section>
  );
}
