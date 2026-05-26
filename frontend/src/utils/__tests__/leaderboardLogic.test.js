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

describe("formatCountdown — hours", () => {
  it("returns 01:00:00 for exactly 1 hour", () => {
    expect(formatCountdown(3600000)).toBe("01:00:00");
  });

  it("returns 12:00:00 for 12 hours", () => {
    expect(formatCountdown(43200000)).toBe("12:00:00");
  });

  it("returns 23:59:59 for one second less than a full day", () => {
    expect(formatCountdown(86399000)).toBe("23:59:59");
  });
});

describe("formatCountdown — days", () => {
  it("returns '1d 00h 00m' for exactly 1 day", () => {
    expect(formatCountdown(86400000)).toBe("1d 00h 00m");
  });

  it("returns '2d 06h 00m' for 2 days and 6 hours", () => {
    expect(formatCountdown(2 * 86400000 + 6 * 3600000)).toBe("2d 06h 00m");
  });

  it("returns '7d 12h 30m' for 7 days, 12 hours, 30 minutes", () => {
    expect(formatCountdown(7 * 86400000 + 12 * 3600000 + 30 * 60000)).toBe("7d 12h 30m");
  });
});

describe("formatCountdown — pads single-digit values with leading zeros", () => {
  it("pads hours less than 10 with a leading zero", () => {
    expect(formatCountdown(3600000 + 5000)).toBe("01:00:05");
  });

  it("pads minutes less than 10 with a leading zero", () => {
    expect(formatCountdown(9 * 60000)).toBe("00:09:00");
  });

  it("pads seconds less than 10 with a leading zero", () => {
    expect(formatCountdown(7000)).toBe("00:00:07");
  });

  it("pads hours and minutes in day-format when single digit", () => {
    expect(formatCountdown(86400000 + 3600000 + 60000)).toBe("1d 01h 01m");
  });
});

// ── getMonthEnd ───────────────────────────────────────────────────────────────

describe("getMonthEnd — returns a Date instance", () => {
  it("returns a Date object", () => {
    expect(getMonthEnd()).toBeInstanceOf(Date);
  });

  it("returns a Date that is not NaN (i.e. valid)", () => {
    expect(isNaN(getMonthEnd().getTime())).toBe(false);
  });
});

describe("getMonthEnd — returns last day of current UTC month", () => {
  it("returned date is in the same UTC month as today", () => {
    const end = getMonthEnd();
    const now = new Date();
    expect(end.getUTCMonth()).toBe(now.getUTCMonth());
  });

  it("returned date day equals the last day of the current month", () => {
    const end   = getMonthEnd();
    const year  = end.getUTCFullYear();
    const month = end.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    expect(end.getUTCDate()).toBe(lastDay);
  });

  it("returned year matches current UTC year", () => {
    expect(getMonthEnd().getUTCFullYear()).toBe(new Date().getUTCFullYear());
  });
});
