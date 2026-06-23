import React, { useState, useEffect, useCallback } from 'react';
import { GAME_MODE_PVP } from '../utils/constants';
import { fetchPendingChallenge } from '../utils/pvp';

export default function PvPLobby({
  walletAddr,
  processing,
  gameMode,
  pvpOpponent,
  pvpOutboundChallenge,
  connectWallet,
  createPvPChallenge,
  acceptPvPChallenge,
  declinePvPChallenge,
  cancelPvPChallenge,
  navigate,
  addLog,
}) {
  const [challengeInput, setChallengeInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [outboundStatus, setOutboundStatus] = useState(null);
  const [incomingChallenges, setIncomingChallenges] = useState([]);

  useEffect(() => {
    if (!pvpOutboundChallenge) { setOutboundStatus(null); return; }
    setOutboundStatus('pending');
  }, [pvpOutboundChallenge]);

  const handleAccept = useCallback(async (challengerAddr) => {
    await acceptPvPChallenge(challengerAddr);
    setIncomingChallenges((prev) => prev.filter((c) => c.challenger !== challengerAddr));
    navigate('game');
  }, [acceptPvPChallenge, navigate]);

  const handleDecline = useCallback(async (challengerAddr) => {
    await declinePvPChallenge(challengerAddr);
    setIncomingChallenges((prev) => prev.filter((c) => c.challenger !== challengerAddr));
  }, [declinePvPChallenge]);

  return (
    <div className="page active pvp-lobby" id="page-pvp">
      <div className="eyebrow">PvP Challenge Lobby · Stacks Blockchain</div>
      <h2 className="pvp-title">Player vs Player</h2>
      <p className="pvp-subtitle">
        Challenge any wallet holder to a live on-chain game. PvP wins earn
        <strong> 5 pts</strong> versus 3 pts for AI wins.
      </p>

      {!walletAddr && (
        <div className="pvp-connect-prompt">
          <p>Connect your wallet to send or accept challenges.</p>
          <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
        </div>
      )}

      {walletAddr && pvpOutboundChallenge && (
        <div className="pvp-card pvp-card-pending">
          <div className="pvp-card-title">Challenge Sent</div>
          <p className="pvp-card-desc">
            Waiting for <strong>{pvpOutboundChallenge.slice(0, 14)}…</strong> to accept.
          </p>
          <div className="pvp-pending-dot-row">
            <span className="pvp-pending-dot" />
            <span className="pvp-pending-dot" />
            <span className="pvp-pending-dot" />
          </div>
          <button
            className="btn btn-secondary"
            disabled={processing}
            onClick={cancelPvPChallenge}
          >
            {processing ? 'Cancelling…' : 'Cancel Challenge'}
          </button>
        </div>
      )}

      {walletAddr && incomingChallenges.length > 0 && (
        <div className="pvp-card pvp-card-incoming">
          <div className="pvp-card-title">Incoming Challenges</div>
          {incomingChallenges.map((c) => (
            <div key={c.challenger} className="pvp-incoming-row">
              <span className="pvp-challenger-addr">{c.challenger.slice(0, 14)}…</span>
              <div className="pvp-incoming-btns">
                <button className="btn btn-primary" disabled={processing} onClick={() => handleAccept(c.challenger)}>Accept</button>
                <button className="btn btn-secondary" disabled={processing} onClick={() => handleDecline(c.challenger)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {walletAddr && !pvpOutboundChallenge && gameMode !== GAME_MODE_PVP && (
        <div className="pvp-card">
          <div className="pvp-card-title">Send a Challenge</div>
          <p className="pvp-card-desc">
            Enter the opponent's STX address or BNS name (e.g. <em>alice.btc</em>).
          </p>
          <div className="pvp-input-row">
            <input
              className={`pvp-input${inputError ? ' pvp-input-error' : ''}`}
              type="text"
              placeholder="SP… or name.btc"
              value={challengeInput}
              onChange={(e) => { setChallengeInput(e.target.value); setInputError(''); }}
              disabled={processing}
            />
            <button
              className="btn btn-primary"
              disabled={processing || !challengeInput.trim()}
              onClick={() => {
                const addr = challengeInput.trim();
                if (!addr.startsWith('SP') && !addr.startsWith('SM') && !addr.includes('.')) {
                  setInputError('Enter a valid STX address or BNS name.');
                  return;
                }
                createPvPChallenge(addr);
                setChallengeInput('');
              }}
            >
              {processing ? 'Sending…' : 'Challenge'}
            </button>
          </div>
          {inputError && <p className="pvp-input-err-msg">{inputError}</p>}
        </div>
      )}
    </div>
  );
}
