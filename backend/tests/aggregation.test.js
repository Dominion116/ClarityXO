/**
 * Unit tests for streak and all-time stats aggregation logic.
 * Exercises the algorithm used in aggregatePlayerStats without MongoDB.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline re-implementation of streak computation (mirrors server.js logic)
function computeStreak(orderedGames) {
  let currentStreak = 0;
  let bestStreak = 0;
  for (const game of orderedGames) {
    if (game.outcome === 'win') {
      currentStreak += 1;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else if (game.outcome === 'loss') {
      currentStreak = 0;
    }
    // draw: streak unchanged
  }
  return { currentStreak, bestStreak };
}

function computeAllTimeStats(monthDocs, address) {
  let allTimeWins = 0;
  let allTimeDraws = 0;
  let allTimeLosses = 0;
  let allTimePts = 0;
  for (const doc of monthDocs) {
    const s = doc.players?.[address] || {};
    allTimeWins   += Number(s.wins   || 0);
    allTimeDraws  += Number(s.draws  || 0);
    allTimeLosses += Number(s.losses || 0);
    allTimePts    += Number(s.pts    || 0);
  }
  return { allTimeWins, allTimeDraws, allTimeLosses, allTimePts, allTimeGames: allTimeWins + allTimeDraws + allTimeLosses };
}

// ── Streak computation ────────────────────────────────────────────────────────

describe('computeStreak', () => {
  it('returns 0,0 for empty game history', () => {
    const { currentStreak, bestStreak } = computeStreak([]);
    assert.equal(currentStreak, 0);
    assert.equal(bestStreak, 0);
  });

  it('counts consecutive wins correctly', () => {
    const games = [
      { outcome: 'win' },
      { outcome: 'win' },
      { outcome: 'win' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 3);
    assert.equal(bestStreak, 3);
  });

  it('resets streak on loss', () => {
    const games = [
      { outcome: 'win' },
      { outcome: 'win' },
      { outcome: 'loss' },
      { outcome: 'win' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 1);
    assert.equal(bestStreak, 2);
  });

  it('draw does not reset streak', () => {
    const games = [
      { outcome: 'win' },
      { outcome: 'draw' },
      { outcome: 'win' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 3);
    assert.equal(bestStreak, 3);
  });

  it('records best streak even after it ends', () => {
    const games = [
      { outcome: 'win' },
      { outcome: 'win' },
      { outcome: 'win' },
      { outcome: 'loss' },
      { outcome: 'win' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 1);
    assert.equal(bestStreak, 3);
  });

  it('only losses not draws reset streak', () => {
    const games = [
      { outcome: 'win' },
      { outcome: 'draw' },
      { outcome: 'draw' },
      { outcome: 'win' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 4);
  });

  it('handles all losses', () => {
    const games = [
      { outcome: 'loss' },
      { outcome: 'loss' },
    ];
    const { currentStreak, bestStreak } = computeStreak(games);
    assert.equal(currentStreak, 0);
    assert.equal(bestStreak, 0);
  });
});

// ── All-time stats aggregation ────────────────────────────────────────────────

describe('computeAllTimeStats', () => {
  const addr = 'SP123';

  it('returns zeros when no monthly docs', () => {
    const stats = computeAllTimeStats([], addr);
    assert.equal(stats.allTimeWins, 0);
    assert.equal(stats.allTimeDraws, 0);
    assert.equal(stats.allTimeLosses, 0);
    assert.equal(stats.allTimePts, 0);
    assert.equal(stats.allTimeGames, 0);
  });

  it('sums wins across multiple months', () => {
    const docs = [
      { players: { [addr]: { wins: 3, draws: 0, losses: 1, pts: 9 } } },
      { players: { [addr]: { wins: 2, draws: 1, losses: 0, pts: 7 } } },
    ];
    const stats = computeAllTimeStats(docs, addr);
    assert.equal(stats.allTimeWins, 5);
  });

  it('sums draws across multiple months', () => {
    const docs = [
      { players: { [addr]: { wins: 0, draws: 2, losses: 0, pts: 2 } } },
      { players: { [addr]: { wins: 0, draws: 3, losses: 0, pts: 3 } } },
    ];
    const stats = computeAllTimeStats(docs, addr);
    assert.equal(stats.allTimeDraws, 5);
  });

  it('sums pts across multiple months', () => {
    const docs = [
      { players: { [addr]: { wins: 2, draws: 1, losses: 1, pts: 7 } } },
      { players: { [addr]: { wins: 1, draws: 0, losses: 2, pts: 3 } } },
    ];
    const stats = computeAllTimeStats(docs, addr);
    assert.equal(stats.allTimePts, 10);
  });

  it('computes allTimeGames as wins + draws + losses', () => {
    const docs = [
      { players: { [addr]: { wins: 2, draws: 1, losses: 1, pts: 7 } } },
    ];
    const stats = computeAllTimeStats(docs, addr);
    assert.equal(stats.allTimeGames, 4);
  });

  it('returns zeros for months where address has no entry', () => {
    const docs = [
      { players: { OTHER: { wins: 5, draws: 0, losses: 0, pts: 15 } } },
    ];
    const stats = computeAllTimeStats(docs, addr);
    assert.equal(stats.allTimeWins, 0);
  });
});
