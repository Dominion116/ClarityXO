import { useState, useEffect, useRef } from 'react';
import { formatCountdown, getMonthEnd } from '../utils/leaderboardLogic';

export function useCountdown() {
  const [countdown, setCountdown] = useState(() => formatCountdown(getMonthEnd() - Date.now()));
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown(formatCountdown(getMonthEnd() - Date.now()));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return countdown;
}
