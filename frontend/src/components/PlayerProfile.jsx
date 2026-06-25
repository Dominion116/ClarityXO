import React, { useState, useEffect, useCallback } from 'react';
import { resolveAddressName } from '../utils/bns';
import { fetchPlayerProfile } from '../utils/profile';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useAchievements } from '../hooks/useAchievements';
import AchievementBadge from './AchievementBadge';

export default function PlayerProfile({ address, onClose, onChallenge, walletAddr }) {
  const [bnsName, setBnsName] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const { stats, loading: statsLoading } = usePlayerStats(address);
  const { unlocked, locked, loading: achievementsLoading } = useAchievements(address);

  useEffect(() => {
    if (!address) return;
    resolveAddressName(address).then(setBnsName);
    fetchPlayerProfile(address).then(setProfile);
  }, [address]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!address) return null;

  const displayName = profile?.name ?? bnsName ?? `${address.slice(0, 12)}…${address.slice(-6)}`;
  const isOwnProfile = walletAddr && address === walletAddr;

  return (
    <div className="profile-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="profile-modal">
        <button className="profile-close" onClick={onClose} aria-label="Close profile">✕</button>

        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" width={48} height={48}
                style={{ objectFit: 'cover', borderRadius: '50%', display: 'block' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="profile-avatar-placeholder">{(displayName[0] || '?').toUpperCase()}</div>
            )}
          </div>
          <div className="profile-identity">
            <div className="profile-name">{displayName}</div>
            {bnsName && <div className="profile-address">{address.slice(0, 16)}…</div>}
            {isOwnProfile && <div className="profile-you-badge">You</div>}
          </div>
        </div>

        <div className="profile-stats">
          {statsLoading ? (
            <div className="profile-stats-loading">Loading stats…</div>
          ) : stats ? (
            <>
              <div className="profile-stat">
                <div className="profile-stat-val green">{stats.allTimeWins}</div>
                <div className="profile-stat-label">Wins</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.allTimeDraws}</div>
                <div className="profile-stat-label">Draws</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.allTimeLosses}</div>
                <div className="profile-stat-label">Losses</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val gold">{stats.currentStreak}{stats.currentStreak >= 3 ? ' 🔥' : ''}</div>
                <div className="profile-stat-label">Streak</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.bestStreak}</div>
                <div className="profile-stat-label">Best</div>
              </div>
            </>
          ) : (
            <div className="profile-stats-empty">No games recorded yet.</div>
          )}
        </div>

        <div className="profile-achievements">
          <div className="profile-section-label">
            Achievements ({unlocked.length})
          </div>
          {achievementsLoading ? (
            <div className="profile-stats-loading">Loading…</div>
          ) : (
            <div className="profile-achievement-list">
              {unlocked.slice(0, showAllAchievements ? undefined : 5).map((a) => (
                <AchievementBadge key={a.id} achievement={a} locked={false} />
              ))}
              {!showAllAchievements && (unlocked.length > 5 || locked.length > 0) && (
                <button className="ghost-btn" style={{ fontSize: 9, padding: '4px 8px' }}
                  onClick={() => setShowAllAchievements(true)}>
                  +{unlocked.length - 5 + locked.length} more
                </button>
              )}
              {showAllAchievements && locked.map((a) => (
                <AchievementBadge key={a.id} achievement={a} locked={true} />
              ))}
            </div>
          )}
        </div>

        {!isOwnProfile && onChallenge && (
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => { onChallenge(address); onClose(); }}>
              ⚔ Challenge to PvP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
