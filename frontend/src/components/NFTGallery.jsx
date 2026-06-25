import React from 'react';
import { useNFTs } from '../hooks/useNFTs';
import TrophyCard from './TrophyCard';

export default function NFTGallery({ walletAddr, navigate }) {
  const { trophies, loading } = useNFTs(walletAddr);

  return (
    <div className="page active" id="page-gallery">
      <div className="lb-header">
        <div className="lb-header-left">
          <div className="lb-title">My Trophies</div>
          <div className="lb-week">{trophies.length} trophy{trophies.length !== 1 ? 'ies' : ''} collected</div>
        </div>
        <div className="lb-header-right">
          <button className="lb-action-btn" onClick={() => navigate('leaderboard')}>← Leaderboard</button>
        </div>
      </div>

      {loading ? (
        <div className="gallery-loading">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="trophy-card skeleton-box" style={{ height: 120 }} />
          ))}
        </div>
      ) : trophies.length === 0 ? (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">◈</div>
          <div className="gallery-empty-title">No trophies yet</div>
          <div className="gallery-empty-body">
            Reach the top 5 on the monthly leaderboard and claim your Trophy NFT at month end.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('leaderboard')}>
            View Leaderboard
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {trophies.map((t, i) => (
            <TrophyCard key={t.tokenId ?? i} trophy={t} />
          ))}
        </div>
      )}

      <div className="footer">
        ClarityXO Trophies · SIP-009 NFTs on Stacks · {new Date().getFullYear()}
      </div>
    </div>
  );
}
