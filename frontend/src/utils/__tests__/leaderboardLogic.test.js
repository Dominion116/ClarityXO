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

describe("getPlayerList — breaks wins tie by losses ascending", () => {
  it("player with fewer losses ranks higher on equal pts and wins", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 5 },
        "SP2": { pts: 3, wins: 1, draws: 0, losses: 1 },
      },
    };
    expect(getPlayerList(data)[0].addr).toBe("SP2");
  });

  it("zero-loss player ranks above one-loss player on equal pts and wins", () => {
    const data = {
      players: {
        "SP1": { pts: 6, wins: 2, draws: 0, losses: 0 },
        "SP2": { pts: 6, wins: 2, draws: 0, losses: 1 },
      },
    };
    expect(getPlayerList(data)[0].addr).toBe("SP1");
  });

  it("full tiebreak chain pts→wins→losses gives correct final order", () => {
    const data = {
      players: {
        "SP1": { pts: 3, wins: 1, draws: 0, losses: 10 },
        "SP2": { pts: 3, wins: 1, draws: 0, losses: 2 },
        "SP3": { pts: 3, wins: 2, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].addr).toBe("SP3");
    expect(list[1].addr).toBe("SP2");
    expect(list[2].addr).toBe("SP1");
  });
});

describe("getPlayerList — calculates games as wins+draws+losses", () => {
  it("games = 1 for a player with 1 win", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].games).toBe(1);
  });

  it("games = 5 for 2 wins + 1 draw + 2 losses", () => {
    const data = { players: { "SP1": { pts: 7, wins: 2, draws: 1, losses: 2 } } };
    expect(getPlayerList(data)[0].games).toBe(5);
  });

  it("games = 0 for a player with all zeros", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].games).toBe(0);
  });
});

describe("getPlayerList — handles player with zero stats", () => {
  it("maps pts as 0 correctly", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].pts).toBe(0);
  });

  it("maps wins as 0 correctly", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].wins).toBe(0);
  });
});

describe("getPlayerList — handles missing pts field (defaults to 0)", () => {
  it("missing pts becomes 0", () => {
    const data = { players: { "SP1": { wins: 1, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].pts).toBe(0);
  });

  it("missing pts does not crash — returns valid entry", () => {
    const data = { players: { "SP1": { wins: 1, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)).toHaveLength(1);
  });
});

describe("getPlayerList — handles missing wins field (defaults to 0)", () => {
  it("missing wins becomes 0", () => {
    const data = { players: { "SP1": { pts: 3, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].wins).toBe(0);
  });

  it("missing wins does not affect games total beyond wins contribution", () => {
    const data = { players: { "SP1": { pts: 0, draws: 1, losses: 2 } } };
    expect(getPlayerList(data)[0].games).toBe(3);
  });
});

describe("getPlayerList — handles missing draws field (defaults to 0)", () => {
  it("missing draws becomes 0", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, losses: 0 } } };
    expect(getPlayerList(data)[0].draws).toBe(0);
  });

  it("missing draws keeps games count correct", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, losses: 2 } } };
    expect(getPlayerList(data)[0].games).toBe(3);
  });
});

describe("getPlayerList — handles missing losses field (defaults to 0)", () => {
  it("missing losses becomes 0", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, draws: 0 } } };
    expect(getPlayerList(data)[0].losses).toBe(0);
  });

  it("missing losses keeps games count correct", () => {
    const data = { players: { "SP1": { pts: 3, wins: 1, draws: 2 } } };
    expect(getPlayerList(data)[0].games).toBe(3);
  });
});

describe("getPlayerList — handles legacy losss typo in data", () => {
  it("reads losses from losss field when losses is missing", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losss: 3 } } };
    expect(getPlayerList(data)[0].losses).toBe(3);
  });

  it("legacy losss field contributes to games count", () => {
    const data = { players: { "SP1": { pts: 0, wins: 1, draws: 0, losss: 2 } } };
    expect(getPlayerList(data)[0].games).toBe(3);
  });

  it("losses field takes precedence over losss when both present", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losses: 1, losss: 99 } } };
    expect(getPlayerList(data)[0].losses).toBe(1);
  });
});

describe("getPlayerList — coerces NaN stats values to 0", () => {
  it("undefined pts becomes 0", () => {
    const data = { players: { "SP1": { pts: undefined, wins: 0, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].pts).toBe(0);
  });

  it("null wins becomes 0", () => {
    const data = { players: { "SP1": { pts: 3, wins: null, draws: 0, losses: 0 } } };
    expect(getPlayerList(data)[0].wins).toBe(0);
  });

  it("string 'abc' for losses becomes 0", () => {
    const data = { players: { "SP1": { pts: 0, wins: 0, draws: 0, losses: "abc" } } };
    expect(getPlayerList(data)[0].losses).toBe(0);
  });
});

describe("getPlayerList — handles large dataset (50 players) sorted correctly", () => {
  it("50 players are returned and first has highest pts", () => {
    const players = {};
    for (let i = 0; i < 50; i++) {
      players[`SP${i}`] = { pts: i, wins: Math.floor(i / 3), draws: 0, losses: 0 };
    }
    const list = getPlayerList({ players });
    expect(list).toHaveLength(50);
    expect(list[0].pts).toBe(49);
  });

  it("50 players last entry has pts=0", () => {
    const players = {};
    for (let i = 0; i < 50; i++) {
      players[`SP${i}`] = { pts: i, wins: Math.floor(i / 3), draws: 0, losses: 0 };
    }
    const list = getPlayerList({ players });
    expect(list[49].pts).toBe(0);
  });
});

// ── Additional edge cases ────────────────────────────────────────────────────

describe("getPlayerList — all players with equal pts sorted by wins desc", () => {
  it("two players with same pts: higher wins ranks first", () => {
    const data = {
      players: {
        SP1: { pts: 10, wins: 5, draws: 0, losses: 0 },
        SP2: { pts: 10, wins: 3, draws: 1, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].address).toBe("SP1");
    expect(list[1].address).toBe("SP2");
  });

  it("three players all equal pts and wins: fewer losses ranks first", () => {
    const data = {
      players: {
        SP1: { pts: 6, wins: 2, draws: 0, losses: 3 },
        SP2: { pts: 6, wins: 2, draws: 0, losses: 1 },
        SP3: { pts: 6, wins: 2, draws: 0, losses: 2 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].address).toBe("SP2");
  });
});

describe("getPlayerList — games field is calculated correctly", () => {
  it("games = wins + draws + losses", () => {
    const data = {
      players: {
        SP1: { pts: 7, wins: 2, draws: 1, losses: 3 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].games).toBe(6);
  });

  it("games is 0 when all stats are 0", () => {
    const data = {
      players: {
        SP1: { pts: 0, wins: 0, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].games).toBe(0);
  });

  it("single win gives games=1", () => {
    const data = {
      players: {
        SP1: { pts: 3, wins: 1, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].games).toBe(1);
  });
});

describe("formatCountdown — boundary seconds", () => {
  it("59 seconds formats as 00:00:59", () => {
    expect(formatCountdown(59_000)).toBe("00:00:59");
  });

  it("60 seconds formats as 00:01:00", () => {
    expect(formatCountdown(60_000)).toBe("00:01:00");
  });

  it("3599 seconds formats as 00:59:59", () => {
    expect(formatCountdown(3_599_000)).toBe("00:59:59");
  });

  it("3600 seconds formats as 01:00:00", () => {
    expect(formatCountdown(3_600_000)).toBe("01:00:00");
  });
});

describe("getPlayerList — address field is set from object key", () => {
  it("address on returned player matches the key used in players object", () => {
    const data = {
      players: {
        "SP_ALICE": { pts: 5, wins: 1, draws: 1, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].address).toBe("SP_ALICE");
  });

  it("two players have distinct address fields from their keys", () => {
    const data = {
      players: {
        "SP_BOB":   { pts: 9, wins: 3, draws: 0, losses: 0 },
        "SP_CAROL": { pts: 6, wins: 2, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list[0].address).toBe("SP_BOB");
    expect(list[1].address).toBe("SP_CAROL");
  });
});

describe("getPlayerList — single player is always rank 1", () => {
  it("single player with zero stats is at index 0", () => {
    const data = {
      players: {
        "SP_ONLY": { pts: 0, wins: 0, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list).toHaveLength(1);
    expect(list[0].address).toBe("SP_ONLY");
  });

  it("single player with high stats is still the only entry", () => {
    const data = {
      players: {
        "SP_TOP": { pts: 99, wins: 33, draws: 0, losses: 0 },
      },
    };
    const list = getPlayerList(data);
    expect(list).toHaveLength(1);
    expect(list[0].pts).toBe(99);
  });
});
