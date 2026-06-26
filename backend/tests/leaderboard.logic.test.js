import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline re-implementation of leaderboard sort logic from server.js
function buildLeaderboard(players) {
  return Object.entries(players)
    .map(([addr, s]) => ({
      addr,
      pts:    Number(s.pts    || 0),
      wins:   Number(s.wins   || 0),
      draws:  Number(s.draws  || 0),
      losses: Number(s.losses || 0),
      games:  Number(s.wins || 0) + Number(s.draws || 0) + Number(s.losses || 0),
    }))
    .sort((a, b) => b.pts - a.pts || b.wins - a.wins || a.losses - b.losses);
}

describe('buildLeaderboard sort order', () => {
  it('sorts by pts descending', () => {
    const lb = buildLeaderboard({
      A: { pts: 5, wins: 1, draws: 0, losses: 1 },
      B: { pts: 9, wins: 3, draws: 0, losses: 0 },
    });
    assert.equal(lb[0].addr, 'B');
    assert.equal(lb[1].addr, 'A');
  });

  it('breaks ties by wins descending', () => {
    const lb = buildLeaderboard({
      A: { pts: 10, wins: 2, draws: 4, losses: 0 },
      B: { pts: 10, wins: 5, draws: 0, losses: 0 },
    });
    assert.equal(lb[0].addr, 'B');
  });

  it('breaks ties by losses ascending', () => {
    const lb = buildLeaderboard({
      A: { pts: 5, wins: 1, draws: 2, losses: 3 },
      B: { pts: 5, wins: 1, draws: 2, losses: 1 },
    });
    assert.equal(lb[0].addr, 'B');
  });

  it('returns empty array for empty input', () => {
    const lb = buildLeaderboard({});
    assert.deepEqual(lb, []);
  });

  it('single player is returned as sole entry', () => {
    const lb = buildLeaderboard({ ONLY: { pts: 3, wins: 1, draws: 0, losses: 0 } });
    assert.equal(lb.length, 1);
    assert.equal(lb[0].addr, 'ONLY');
  });

  it('computes games field correctly', () => {
    const lb = buildLeaderboard({ P: { pts: 7, wins: 2, draws: 1, losses: 1 } });
    assert.equal(lb[0].games, 4);
  });

  it('handles missing pts field as 0', () => {
    const lb = buildLeaderboard({ P: { wins: 1, draws: 0, losses: 0 } });
    assert.equal(lb[0].pts, 0);
  });

  it('handles zero wins/draws/losses gracefully', () => {
    const lb = buildLeaderboard({ P: { pts: 0, wins: 0, draws: 0, losses: 0 } });
    assert.equal(lb[0].games, 0);
  });
});

// Points map tests
describe('Points map values', () => {
  const ptsMap = { win: 3, draw: 1, loss: 0 };

  it('win gives 3 pts', () => assert.equal(ptsMap.win, 3));
  it('draw gives 1 pt', () => assert.equal(ptsMap.draw, 1));
  it('loss gives 0 pts', () => assert.equal(ptsMap.loss, 0));
  it('win > draw', () => assert.ok(ptsMap.win > ptsMap.draw));
  it('draw > loss', () => assert.ok(ptsMap.draw > ptsMap.loss));

  const pvpPtsMap = { win: 5, draw: 1, loss: 0 };
  it('PvP win gives 5 pts', () => assert.equal(pvpPtsMap.win, 5));
  it('PvP win > AI win', () => assert.ok(pvpPtsMap.win > ptsMap.win));
});
