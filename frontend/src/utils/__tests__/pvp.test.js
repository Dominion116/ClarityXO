import { describe, it, expect } from 'vitest';
import { deriveMyMarker, isMyPvpTurn } from '../pvp';
import { PLAYER_X, PLAYER_O } from '../constants';

const CHALLENGER = 'SP3CHALLENGER0000000000000000000000000000';
const ACCEPTOR = 'SP3ACCEPTOR000000000000000000000000000000';
const OUTSIDER = 'SP3OUTSIDER000000000000000000000000000000';

describe('deriveMyMarker', () => {
  it('gives the challenger (x-player) marker X', () => {
    expect(deriveMyMarker(CHALLENGER, ACCEPTOR, CHALLENGER)).toBe(PLAYER_X);
  });

  it('gives the acceptor (o-player) marker O', () => {
    expect(deriveMyMarker(CHALLENGER, ACCEPTOR, ACCEPTOR)).toBe(PLAYER_O);
  });

  it('returns null for a non-participant (spectator)', () => {
    expect(deriveMyMarker(CHALLENGER, ACCEPTOR, OUTSIDER)).toBeNull();
  });

  it('returns null when the wallet address is missing', () => {
    expect(deriveMyMarker(CHALLENGER, ACCEPTOR, null)).toBeNull();
  });
});

describe('isMyPvpTurn', () => {
  it('is true when the on-chain turn matches my marker', () => {
    expect(isMyPvpTurn(PLAYER_X, PLAYER_X)).toBe(true);
    expect(isMyPvpTurn(PLAYER_O, PLAYER_O)).toBe(true);
  });

  it('is false when it is the opponent\'s turn', () => {
    expect(isMyPvpTurn(PLAYER_X, PLAYER_O)).toBe(false);
    expect(isMyPvpTurn(PLAYER_O, PLAYER_X)).toBe(false);
  });

  it('is false when the marker is unknown', () => {
    expect(isMyPvpTurn(null, PLAYER_X)).toBe(false);
  });
});

describe('PvP turn ordering (challenger X moves first)', () => {
  // The contract sets turn = PLAYER_X when a game is accepted, and flips it
  // after every accepted move. These assertions document the full happy path.
  it('lets X move first and blocks O until X has played', () => {
    const xMarker = deriveMyMarker(CHALLENGER, ACCEPTOR, CHALLENGER);
    const oMarker = deriveMyMarker(CHALLENGER, ACCEPTOR, ACCEPTOR);

    // Fresh game: on-chain turn is X.
    let turn = PLAYER_X;
    expect(isMyPvpTurn(xMarker, turn)).toBe(true);   // challenger may move
    expect(isMyPvpTurn(oMarker, turn)).toBe(false);  // acceptor must wait

    // After X moves the contract flips the turn to O.
    turn = PLAYER_O;
    expect(isMyPvpTurn(xMarker, turn)).toBe(false);
    expect(isMyPvpTurn(oMarker, turn)).toBe(true);
  });
});
