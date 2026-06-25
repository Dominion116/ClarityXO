import React from 'react';

const RANK_CLASSES = { 1: 'gold', 2: 'silver', 3: 'bronze' };
const RANK_LABELS = { 1: '#1 Champion', 2: '#2 Runner-up', 3: '#3 Third Place', 4: '#4', 5: '#5' };

export default function TrophyCard({ trophy }) {
  const { tokenId, month, rank, claimedAt } = trophy;
  const rankClass = RANK_CLASSES[rank] || 'other';
  const rankLabel = RANK_LABELS[rank] || `#${rank}`;
  const claimedDate = claimedAt ? new Date(claimedAt).toLocaleDateString() : null;

  return (
    <div className={`trophy-card trophy-${rankClass}`}>
      <div className="trophy-icon">◈</div>
      <div className="trophy-rank">{rankLabel}</div>
      <div className="trophy-month">Season {month}</div>
      {claimedDate && <div className="trophy-date">Claimed {claimedDate}</div>}
      {tokenId && <div className="trophy-id">Token #{tokenId}</div>}
    </div>
  );
}
