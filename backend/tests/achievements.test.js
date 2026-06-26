import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENT_DEFINITIONS, checkAchievements } from '../achievements.js';

describe('ACHIEVEMENT_DEFINITIONS', () => {
  it('contains at least 9 achievements', () => {
    assert.ok(ACHIEVEMENT_DEFINITIONS.length >= 9);
  });

  it('every achievement has id, name, description, and icon', () => {
    for (const a of ACHIEVEMENT_DEFINITIONS) {
      assert.ok(a.id, `Missing id on ${JSON.stringify(a)}`);
      assert.ok(a.name, `Missing name on ${a.id}`);
      assert.ok(a.description, `Missing description on ${a.id}`);
      assert.ok(a.icon, `Missing icon on ${a.id}`);
    }
  });

  it('achievement ids are unique', () => {
    const ids = ACHIEVEMENT_DEFINITIONS.map(a => a.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length);
  });
});

describe('checkAchievements', () => {
  const noGames = [];

  it('returns empty array for a player with no stats', () => {
    const result = checkAchievements({ allTimeWins: 0, allTimeDraws: 0, allTimeGames: 0, currentStreak: 0 }, noGames);
    assert.deepEqual(result, []);
  });

  it('unlocks first-win after first win', () => {
    const result = checkAchievements({ allTimeWins: 1, allTimeDraws: 0, allTimeGames: 1, currentStreak: 1 }, noGames);
    assert.ok(result.includes('first-win'));
  });

  it('unlocks streak-3 when currentStreak is 3', () => {
    const result = checkAchievements({ allTimeWins: 3, allTimeDraws: 0, allTimeGames: 3, currentStreak: 3 }, noGames);
    assert.ok(result.includes('streak-3'));
  });

  it('does not unlock streak-5 when currentStreak is only 4', () => {
    const result = checkAchievements({ allTimeWins: 4, allTimeDraws: 0, allTimeGames: 4, currentStreak: 4 }, noGames);
    assert.ok(!result.includes('streak-5'));
  });

  it('unlocks streak-5 when currentStreak is 5', () => {
    const result = checkAchievements({ allTimeWins: 5, allTimeDraws: 0, allTimeGames: 5, currentStreak: 5 }, noGames);
    assert.ok(result.includes('streak-5'));
  });

  it('unlocks streak-10 when currentStreak is 10', () => {
    const result = checkAchievements({ allTimeWins: 10, allTimeDraws: 0, allTimeGames: 10, currentStreak: 10 }, noGames);
    assert.ok(result.includes('streak-10'));
  });

  it('unlocks first-pvp-win when pvp game win exists', () => {
    const games = [{ gameMode: 'pvp', outcome: 'win' }];
    const result = checkAchievements({ allTimeWins: 1, allTimeDraws: 0, allTimeGames: 1, currentStreak: 1 }, games);
    assert.ok(result.includes('first-pvp-win'));
  });

  it('does not unlock first-pvp-win for AI wins', () => {
    const games = [{ gameMode: 'ai', outcome: 'win' }];
    const result = checkAchievements({ allTimeWins: 1, allTimeDraws: 0, allTimeGames: 1, currentStreak: 1 }, games);
    assert.ok(!result.includes('first-pvp-win'));
  });

  it('unlocks draw-master when allTimeDraws is 10', () => {
    const result = checkAchievements({ allTimeWins: 0, allTimeDraws: 10, allTimeGames: 10, currentStreak: 0 }, noGames);
    assert.ok(result.includes('draw-master'));
  });

  it('unlocks century when allTimeGames is 100', () => {
    const result = checkAchievements({ allTimeWins: 50, allTimeDraws: 0, allTimeGames: 100, currentStreak: 0 }, noGames);
    assert.ok(result.includes('century'));
  });

  it('does not unlock century when allTimeGames is 99', () => {
    const result = checkAchievements({ allTimeWins: 40, allTimeDraws: 0, allTimeGames: 99, currentStreak: 0 }, noGames);
    assert.ok(!result.includes('century'));
  });

  it('can unlock multiple achievements simultaneously', () => {
    const games = [{ gameMode: 'pvp', outcome: 'win' }];
    const result = checkAchievements({ allTimeWins: 5, allTimeDraws: 10, allTimeGames: 15, currentStreak: 5 }, games);
    assert.ok(result.includes('first-win'));
    assert.ok(result.includes('streak-5'));
    assert.ok(result.includes('draw-master'));
    assert.ok(result.includes('first-pvp-win'));
  });
});
