import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!pvpOutboundChallenge) { setOutboundStatus(null); return; }
    setOutboundStatus('pending');
  }, [pvpOutboundChallenge]);

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
    </div>
  );
}
