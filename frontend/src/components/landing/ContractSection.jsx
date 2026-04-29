import { CONFIG } from "../../config";
export default function ContractSection() {
  return (
    <section className="lp-contract-section">
      <div className="lp-section-title">Smart Contract</div>
      <div className="lp-contract-grid">
        <div className="lp-contract-left">
          <div className="lp-contract-label">Contract Address · Stacks Mainnet</div>
          <div className="lp-contract-addr"><span>{CONFIG.contractAddress}</span><br />.{CONFIG.contractName}</div>
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
