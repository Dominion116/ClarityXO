import React from 'react';

export default function StatsStrip({ stats, loading }) {
  if (loading) {
    return (
      <div className="stats-strip">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stats-strip-item">
            <div className="skeleton-box skeleton-text short" style={{ marginBottom: 4, height: 8 }} />
            <div className="skeleton-box skeleton-text" style={{ height: 16, width: 32 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const {
    allTimeWins = 0,
    allTimeDraws = 0,
    allTimeLosses = 0,
    currentStreak = 0,
    bestStreak = 0,
  } = stats;

  return (
    <div className="stats-strip">
      <div className="stats-strip-item">
        <div className="stats-strip-label">All-time W</div>
        <div className="stats-strip-val green">{allTimeWins}</div>
      </div>
      <div className="stats-strip-item">
        <div className="stats-strip-label">Draws</div>
        <div className="stats-strip-val">{allTimeDraws}</div>
      </div>
      <div className="stats-strip-item">
        <div className="stats-strip-label">Losses</div>
        <div className="stats-strip-val">{allTimeLosses}</div>
      </div>
      <div className="stats-strip-item">
        <div className="stats-strip-label">Streak</div>
        <div className="stats-strip-val">
          {currentStreak > 0 ? (
            <span>{currentStreak}{currentStreak >= 3 ? ' 🔥' : ''}</span>
          ) : 0}
        </div>
      </div>
      <div className="stats-strip-item">
        <div className="stats-strip-label">Best</div>
        <div className="stats-strip-val gold">{bestStreak}</div>
      </div>
    </div>
  );
}
