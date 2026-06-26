import React, { useState, useEffect } from 'react';
import { generateReferralCode, fetchReferralStats, buildReferralLink } from '../utils/referral';
import { copyToClipboard } from '../utils/share';

export default function ReferralSection({ walletAddr }) {
  const [code, setCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddr) return;
    setLoading(true);
    Promise.all([
      generateReferralCode(walletAddr),
      fetchReferralStats(walletAddr),
    ]).then(([c, s]) => {
      setCode(c);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [walletAddr]);

  const referralLink = code ? buildReferralLink(code) : null;

  const handleCopy = async () => {
    if (!referralLink) return;
    await copyToClipboard(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!walletAddr) return null;

  return (
    <div className="referral-section">
      <div className="referral-title">Invite Friends</div>
      <div className="referral-body">
        Share your link — when a friend connects their wallet and plays their first game, you earn <strong>+5 pts</strong> on the monthly leaderboard.
      </div>

      {loading ? (
        <div className="skeleton-box" style={{ height: 36, width: '100%' }} />
      ) : referralLink ? (
        <div className="referral-link-row">
          <input
            className="referral-link-input"
            readOnly
            value={referralLink}
            onFocus={e => e.target.select()}
          />
          <button className="ghost-btn" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      ) : null}

      {stats && (
        <div className="referral-count">
          You've invited <strong>{stats.referralCount}</strong> player{stats.referralCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
