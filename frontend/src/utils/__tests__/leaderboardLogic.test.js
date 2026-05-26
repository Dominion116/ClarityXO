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

describe("formatCountdown — seconds only", () => {
  it("returns 00:00:01 for exactly 1000ms", () => {
    expect(formatCountdown(1000)).toBe("00:00:01");
  });

  it("returns 00:00:30 for 30 seconds", () => {
    expect(formatCountdown(30000)).toBe("00:00:30");
  });

  it("returns 00:00:59 for 59 seconds", () => {
    expect(formatCountdown(59000)).toBe("00:00:59");
  });
});

describe("formatCountdown — minutes", () => {
  it("returns 00:01:00 for exactly 1 minute", () => {
    expect(formatCountdown(60000)).toBe("00:01:00");
  });

  it("returns 00:30:00 for 30 minutes", () => {
    expect(formatCountdown(1800000)).toBe("00:30:00");
  });

  it("returns 00:59:59 for 59 min 59 sec", () => {
    expect(formatCountdown(3599000)).toBe("00:59:59");
  });
});
