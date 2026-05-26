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

describe("getMonthEnd — time is 23:59:59 UTC", () => {
  it("UTC hours are 23", () => {
    expect(getMonthEnd().getUTCHours()).toBe(23);
  });

  it("UTC minutes are 59", () => {
    expect(getMonthEnd().getUTCMinutes()).toBe(59);
  });
});

describe("getMonthEnd — is in the future relative to start of today", () => {
  it("returned timestamp is greater than the current time minus 24 hours", () => {
    const end  = getMonthEnd().getTime();
    const dayAgo = Date.now() - 86400000;
    expect(end).toBeGreaterThan(dayAgo);
  });

  it("returned timestamp is a positive number", () => {
    expect(getMonthEnd().getTime()).toBeGreaterThan(0);
  });
});

// ── getPlayerList ─────────────────────────────────────────────────────────────

describe("getPlayerList — empty players object", () => {
  it("returns an empty array when players is {}", () => {
    expect(getPlayerList({ players: {} })).toEqual([]);
  });

  it("returns an empty array and not null or undefined", () => {
    const result = getPlayerList({ players: {} });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getPlayerList — single player", () => {
  it("returns an array with one entry for a single player", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)).toHaveLength(1);
  });

  it("maps addr field correctly for single player", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].addr).toBe("SP1");
  });
});

describe("getPlayerList — sorts by pts descending", () => {
  it("higher pts player appears first", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 },
        "SP2": { pts: 9, wins: 3, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].addr).toBe("SP2");
    expect(list[1].addr).toBe("SP1");
  });

  it("three players sorted by pts correctly", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 },
        "SP2": { pts: 6, wins: 2, draws: 0, losses: 0 },
        "SP3": { pts: 1, wins: 0, draws: 1, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list.map(p => p.addr)).toEqual(["SP2", "SP1", "SP3"]);
  });

  it("pts=0 players appear at the bottom", () => {
    const data = {
      players: {
        "SP1": { pts: 0, wins: 0, draws: 0, losses: 2 },
        "SP2": { pts: 3, wins: 1, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].addr).toBe("SP2");
  });
});

describe("getPlayerList — breaks pts tie by wins descending", () => {
  it("player with more wins ranks higher when pts are equal", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 },
        "SP2": { pts: 3, wins: 3, draws: 0, losses: 6 },
      },
    };
    expect(getPlayerList(data)[0].addr).toBe("SP2");
  });

  it("player with fewer wins ranks lower when pts are equal", () => {
    const data = {
      players: {
        "SP1": { pts: 6, wins: 2, draws: 0, losses: 0 },
        "SP2": { pts: 6, wins: 0, draws: 6, losses: 0 },
      },
    };
    expect(getPlayerList(data)[0].addr).toBe("SP1");
  });

  it("three-way tie on pts resolves by wins", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 },
        "SP2": { pts: 3, wins: 3, draws: 0, losses: 4 },
        "SP3": { pts: 3, wins: 2, draws: 0, losses: 2 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].addr).toBe("SP2");
    expect(list[1].addr).toBe("SP3");
  });
});
