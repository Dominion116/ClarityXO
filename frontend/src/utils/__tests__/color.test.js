import { describe, it, expect } from 'vitest';
import { rankColor, outcomeColor, streakColor } from '../color';

describe('rankColor', () => {
  it('rank 1 returns gold', () => expect(rankColor(1)).toBe('var(--gold)'));
  it('rank 2 returns silver', () => expect(rankColor(2)).toBe('var(--silver)'));
  it('rank 3 returns bronze', () => expect(rankColor(3)).toBe('var(--bronze)'));
  it('rank 4 returns muted', () => expect(rankColor(4)).toBe('var(--muted)'));
  it('rank 5 returns muted', () => expect(rankColor(5)).toBe('var(--muted)'));
  it('rank 0 returns muted', () => expect(rankColor(0)).toBe('var(--muted)'));
});

describe('outcomeColor', () => {
  it('win returns green', () => expect(outcomeColor('win')).toBe('var(--green)'));
  it('loss returns red', () => expect(outcomeColor('loss')).toBe('var(--red)'));
  it('draw returns text', () => expect(outcomeColor('draw')).toBe('var(--text)'));
  it('null returns text', () => expect(outcomeColor(null)).toBe('var(--text)'));
});

describe('streakColor', () => {
  it('streak 0 returns text', () => expect(streakColor(0)).toBe('var(--text)'));
  it('streak 2 returns text', () => expect(streakColor(2)).toBe('var(--text)'));
  it('streak 3 returns red', () => expect(streakColor(3)).toBe('var(--red)'));
  it('streak 5 returns green', () => expect(streakColor(5)).toBe('var(--green)'));
  it('streak 10 returns gold', () => expect(streakColor(10)).toBe('var(--gold)'));
  it('streak 15 returns gold', () => expect(streakColor(15)).toBe('var(--gold)'));
});
