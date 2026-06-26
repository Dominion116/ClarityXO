import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Inline re-implementation of referral code generation matching server.js
function generateReferralCode(address) {
  return `${address.slice(2, 8)}${address.slice(-4)}`.toUpperCase();
}

describe('Referral code properties', () => {
  const ADDR_A = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
  const ADDR_B = 'SP2C2YB2M7WZ8Q4P8A9VQYQMW9C03R9X62H2W8A1K';

  it('code is exactly 10 characters', () => {
    assert.equal(generateReferralCode(ADDR_A).length, 10);
  });

  it('code is all uppercase', () => {
    const code = generateReferralCode(ADDR_A);
    assert.equal(code, code.toUpperCase());
  });

  it('same address always produces same code', () => {
    assert.equal(generateReferralCode(ADDR_A), generateReferralCode(ADDR_A));
  });

  it('different addresses produce different codes', () => {
    assert.notEqual(generateReferralCode(ADDR_A), generateReferralCode(ADDR_B));
  });

  it('code does not contain the leading SP prefix characters', () => {
    const code = generateReferralCode(ADDR_A);
    // slice(2,8) skips 'SP' prefix
    assert.ok(!code.startsWith('SP'));
  });
});

// Referral claim deduplication logic
function buildClaimState() {
  const referred = new Set();
  function canClaim(newAddr) {
    return !referred.has(newAddr);
  }
  function claim(newAddr) {
    if (!canClaim(newAddr)) return false;
    referred.add(newAddr);
    return true;
  }
  return { canClaim, claim };
}

describe('Referral claim deduplication', () => {
  it('first claim returns true', () => {
    const { claim } = buildClaimState();
    assert.equal(claim('SP_NEW'), true);
  });

  it('second claim for same address returns false', () => {
    const { claim } = buildClaimState();
    claim('SP_NEW');
    assert.equal(claim('SP_NEW'), false);
  });

  it('different addresses can each claim once', () => {
    const { claim } = buildClaimState();
    assert.equal(claim('SP_A'), true);
    assert.equal(claim('SP_B'), true);
  });

  it('canClaim is false after claim', () => {
    const { claim, canClaim } = buildClaimState();
    claim('SP_NEW');
    assert.equal(canClaim('SP_NEW'), false);
  });

  it('canClaim is true before claim', () => {
    const { canClaim } = buildClaimState();
    assert.equal(canClaim('SP_NEW'), true);
  });
});
