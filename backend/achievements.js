export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '⭐',
  },
  {
    id: 'streak-3',
    name: 'On Fire',
    description: 'Win 3 games in a row',
    icon: '🔥',
  },
  {
    id: 'streak-5',
    name: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '💥',
  },
  {
    id: 'streak-10',
    name: 'Legend',
    description: 'Win 10 games in a row',
    icon: '👑',
  },
  {
    id: 'first-pvp-win',
    name: 'PvP Victor',
    description: 'Win your first PvP game',
    icon: '⚔️',
  },
  {
    id: 'challenger',
    name: 'Challenger',
    description: 'Send your first PvP challenge',
    icon: '📢',
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Claim your first Trophy NFT',
    icon: '◈',
  },
  {
    id: 'draw-master',
    name: 'Draw Master',
    description: 'Accumulate 10 draws',
    icon: '🤝',
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Play 100 total games',
    icon: '💯',
  },
];

export function checkAchievements(stats, allGameResults) {
  const unlocked = [];
  const {
    allTimeWins = 0,
    allTimeDraws = 0,
    allTimeGames = 0,
    currentStreak = 0,
  } = stats;

  const pvpWins = allGameResults.filter(
    (g) => g.gameMode === 'pvp' && g.outcome === 'win'
  ).length;

  if (allTimeWins >= 1) unlocked.push('first-win');
  if (currentStreak >= 3) unlocked.push('streak-3');
  if (currentStreak >= 5) unlocked.push('streak-5');
  if (currentStreak >= 10) unlocked.push('streak-10');
  if (pvpWins >= 1) unlocked.push('first-pvp-win');
  if (allTimeDraws >= 10) unlocked.push('draw-master');
  if (allTimeGames >= 100) unlocked.push('century');

  return unlocked;
}
