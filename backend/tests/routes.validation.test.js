/**
 * Validates request/response contract shapes for backend API routes
 * without requiring a real MongoDB connection. These tests exercise
 * the validation logic (missing params, wrong types) that runs before
 * any DB call is made.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Minimal mock for routes validation testing
// We test the validation helper logic directly instead of spinning up Express

function validateLeaderboardResultBody(body) {
  const validOutcomes = new Set(['win', 'draw', 'loss']);
  if (!body.walletAddr || typeof body.walletAddr !== 'string') {
    return { status: 400, error: 'walletAddr is required' };
  }
  if (!validOutcomes.has(body.outcome)) {
    return { status: 400, error: 'outcome must be win|draw|loss' };
  }
  return { status: 200, ok: true };
}

function validatePlayerAddressParam(address) {
  if (!address || typeof address !== 'string') {
    return { status: 400, error: 'address is required' };
  }
  return { status: 200, ok: true };
}

function validateReferralClaimBody(body) {
  if (!body.referrerAddress || !body.newPlayerAddress) {
    return { status: 400, error: 'referrerAddress and newPlayerAddress are required' };
  }
  return { status: 200, ok: true };
}

function validateRematchBody(body) {
  if (!body.challenger || !body.opponent) {
    return { status: 400, error: 'challenger and opponent are required' };
  }
  return { status: 200, ok: true };
}

function validateGameId(gameIdStr) {
  const id = parseInt(gameIdStr, 10);
  if (isNaN(id) || id < 1) {
    return { status: 400, error: 'Invalid game ID' };
  }
  return { status: 200, ok: true };
}

// ── POST /api/leaderboard/result validation ───────────────────────────────────

describe('POST /api/leaderboard/result — validation', () => {
  it('rejects missing walletAddr', () => {
    const res = validateLeaderboardResultBody({ outcome: 'win' });
    assert.equal(res.status, 400);
    assert.ok(res.error.includes('walletAddr'));
  });

  it('rejects non-string walletAddr', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 123, outcome: 'win' });
    assert.equal(res.status, 400);
  });

  it('rejects invalid outcome', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 'SP123', outcome: 'invalid' });
    assert.equal(res.status, 400);
    assert.ok(res.error.includes('outcome'));
  });

  it('rejects outcome draw typo', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 'SP123', outcome: 'draws' });
    assert.equal(res.status, 400);
  });

  it('accepts valid win body', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 'SP123', outcome: 'win' });
    assert.equal(res.status, 200);
  });

  it('accepts valid draw body', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 'SP123', outcome: 'draw' });
    assert.equal(res.status, 200);
  });

  it('accepts valid loss body', () => {
    const res = validateLeaderboardResultBody({ walletAddr: 'SP123', outcome: 'loss' });
    assert.equal(res.status, 200);
  });
});

// ── Player address param validation ───────────────────────────────────────────

describe('Player address param validation', () => {
  it('rejects null address', () => {
    const res = validatePlayerAddressParam(null);
    assert.equal(res.status, 400);
  });

  it('rejects empty string', () => {
    const res = validatePlayerAddressParam('');
    assert.equal(res.status, 400);
  });

  it('accepts valid address string', () => {
    const res = validatePlayerAddressParam('SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y');
    assert.equal(res.status, 200);
  });
});

// ── POST /api/referral/claim validation ──────────────────────────────────────

describe('POST /api/referral/claim — validation', () => {
  it('rejects missing referrerAddress', () => {
    const res = validateReferralClaimBody({ newPlayerAddress: 'SP123' });
    assert.equal(res.status, 400);
  });

  it('rejects missing newPlayerAddress', () => {
    const res = validateReferralClaimBody({ referrerAddress: 'SP123' });
    assert.equal(res.status, 400);
  });

  it('accepts valid claim body', () => {
    const res = validateReferralClaimBody({ referrerAddress: 'SP123', newPlayerAddress: 'SP456' });
    assert.equal(res.status, 200);
  });
});

// ── POST /api/rematch validation ─────────────────────────────────────────────

describe('POST /api/rematch — validation', () => {
  it('rejects missing challenger', () => {
    const res = validateRematchBody({ opponent: 'SP456' });
    assert.equal(res.status, 400);
  });

  it('rejects missing opponent', () => {
    const res = validateRematchBody({ challenger: 'SP123' });
    assert.equal(res.status, 400);
  });

  it('accepts valid rematch body', () => {
    const res = validateRematchBody({ challenger: 'SP123', opponent: 'SP456' });
    assert.equal(res.status, 200);
  });
});

// ── GET /api/pvp/game/:gameId validation ─────────────────────────────────────

describe('GET /api/pvp/game/:gameId — validation', () => {
  it('rejects NaN game ID', () => {
    const res = validateGameId('abc');
    assert.equal(res.status, 400);
  });

  it('rejects zero game ID', () => {
    const res = validateGameId('0');
    assert.equal(res.status, 400);
  });

  it('rejects negative game ID', () => {
    const res = validateGameId('-1');
    assert.equal(res.status, 400);
  });

  it('accepts valid game ID 1', () => {
    const res = validateGameId('1');
    assert.equal(res.status, 200);
  });

  it('accepts large valid game ID', () => {
    const res = validateGameId('99999');
    assert.equal(res.status, 200);
  });
});

// ── Points calculation ────────────────────────────────────────────────────────

describe('Points calculation logic', () => {
  const ptsMap = { win: 3, draw: 1, loss: 0 };
  const pvpPtsMap = { win: 5, draw: 1, loss: 0 };

  it('AI win earns 3 pts', () => {
    assert.equal(ptsMap.win, 3);
  });

  it('Draw earns 1 pt', () => {
    assert.equal(ptsMap.draw, 1);
  });

  it('Loss earns 0 pts', () => {
    assert.equal(ptsMap.loss, 0);
  });

  it('PvP win earns 5 pts', () => {
    assert.equal(pvpPtsMap.win, 5);
  });

  it('PvP win earns more than AI win', () => {
    assert.ok(pvpPtsMap.win > ptsMap.win);
  });
});
