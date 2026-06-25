import React, { useEffect, useRef } from 'react';

export default function AchievementToast({ achievement, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!achievement) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timerRef.current);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="achievement-toast" role="status" aria-live="polite">
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-body">
        <div className="achievement-toast-label">Achievement Unlocked</div>
        <div className="achievement-toast-name">{achievement.name}</div>
      </div>
      <button className="achievement-toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
