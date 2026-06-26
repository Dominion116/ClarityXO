import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline re-implementation of parseGameState from server.js
function parseGameState(fields) {
  return {
    board: Array.isArray(fields.board?.value)
      ? fields.board.value.map((cell) => Number(cell.value))
      : Array(9).fill(0),
    status: Number(fields.status?.value || 0),
    moves:  Number(fields.moves?.value  || 0),
    month:  Number(fields.month?.value  || 0),
    player: fields.player?.value || null,
  };
}

describe('parseGameState', () => {
  it('returns 9-element board array', () => {
    const state = parseGameState({});
    assert.equal(state.board.length, 9);
  });

  it('fills board with zeros when no board field', () => {
    const state = parseGameState({});
    assert.ok(state.board.every(c => c === 0));
  });

  it('parses board cells from clarity uint values', () => {
    const fields = {
      board: { value: [{ value: '1' }, { value: '2' }, ...Array(7).fill({ value: '0' })] },
      status: { value: '0' },
      moves: { value: '1' },
      month: { value: '5' },
      player: { value: 'SP123' },
    };
    const state = parseGameState(fields);
    assert.equal(state.board[0], 1);
    assert.equal(state.board[1], 2);
    assert.equal(state.board[2], 0);
  });

  it('returns status 0 as default', () => {
    assert.equal(parseGameState({}).status, 0);
  });

  it('parses status from fields', () => {
    const state = parseGameState({ status: { value: '2' } });
    assert.equal(state.status, 2);
  });

  it('returns moves 0 as default', () => {
    assert.equal(parseGameState({}).moves, 0);
  });

  it('parses moves from fields', () => {
    const state = parseGameState({ moves: { value: '3' } });
    assert.equal(state.moves, 3);
  });

  it('returns null player as default', () => {
    assert.equal(parseGameState({}).player, null);
  });

  it('parses player address from fields', () => {
    const state = parseGameState({ player: { value: 'SP123' } });
    assert.equal(state.player, 'SP123');
  });

  it('returns month 0 as default', () => {
    assert.equal(parseGameState({}).month, 0);
  });

  it('parses month from fields', () => {
    const state = parseGameState({ month: { value: '7' } });
    assert.equal(state.month, 7);
  });
});

// Game outcome derivation
function deriveOutcome(status, isPvp) {
  if (status === 1) return { outcome: 'win',  pts: isPvp ? 5 : 3 };
  if (status === 2) return { outcome: 'loss', pts: 0 };
  if (status === 3) return { outcome: 'draw', pts: 1 };
  return null;
}

describe('deriveOutcome', () => {
  it('status 1 is win with 3 pts for AI mode', () => {
    const r = deriveOutcome(1, false);
    assert.equal(r.outcome, 'win');
    assert.equal(r.pts, 3);
  });

  it('status 1 is win with 5 pts for PvP mode', () => {
    const r = deriveOutcome(1, true);
    assert.equal(r.outcome, 'win');
    assert.equal(r.pts, 5);
  });

  it('status 2 is loss with 0 pts', () => {
    const r = deriveOutcome(2, false);
    assert.equal(r.outcome, 'loss');
    assert.equal(r.pts, 0);
  });

  it('status 3 is draw with 1 pt', () => {
    const r = deriveOutcome(3, false);
    assert.equal(r.outcome, 'draw');
    assert.equal(r.pts, 1);
  });

  it('status 0 (active) returns null', () => {
    assert.equal(deriveOutcome(0, false), null);
  });
});
