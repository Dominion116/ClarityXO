import { describe, it, expect } from "vitest";
import { formatCountdown, getMonthEnd, getPlayerList } from "../leaderboardLogic.js";

// ── formatCountdown ───────────────────────────────────────────────────────────

describe("formatCountdown — zero ms", () => {
  it('returns "00:00:00" when ms is exactly 0', () => {
    expect(formatCountdown(0)).toBe("00:00:00");
  });

  it('returns "00:00:00" when ms is 1 (less than 1 full second)', () => {
    expect(formatCountdown(1)).toBe("00:00:00");
  });
});

describe("formatCountdown — negative ms", () => {
  it('returns "00:00:00" for -1ms', () => {
    expect(formatCountdown(-1)).toBe("00:00:00");
  });

  it('returns "00:00:00" for a large negative value', () => {
    expect(formatCountdown(-999999)).toBe("00:00:00");
  });
});
