import React from 'react';

export default function AchievementBadge({ achievement, locked = false }) {
  return (
    <div
      className={`achievement-badge ${locked ? 'locked' : 'unlocked'}`}
      title={locked ? `${achievement.name} — ${achievement.description}` : `Unlocked: ${achievement.name}`}
    >
      <span className="achievement-icon">{achievement.icon}</span>
      <span className="achievement-name">{achievement.name}</span>
    </div>
  );
}
