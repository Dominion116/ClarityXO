import { describe, it, expect } from "vitest";
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from "../constants.js";

// ── Cell value constants ──────────────────────────────────────────────────────

describe("cell value constants", () => {
  it("EMPTY is 0", () => {
    expect(EMPTY).toBe(0);
  });

  it("PLAYER_X is 1", () => {
    expect(PLAYER_X).toBe(1);
  });

  it("PLAYER_O is 2", () => {
    expect(PLAYER_O).toBe(2);
  });
});

// ── Status constants ──────────────────────────────────────────────────────────

describe("STATUS constants are 0,1,2,3 respectively", () => {
  it("STATUS_ACTIVE is 0", () => {
    expect(STATUS_ACTIVE).toBe(0);
  });

  it("STATUS_X_WON is 1", () => {
    expect(STATUS_X_WON).toBe(1);
  });

  it("STATUS_O_WON is 2", () => {
    expect(STATUS_O_WON).toBe(2);
  });

  it("STATUS_DRAW is 3", () => {
    expect(STATUS_DRAW).toBe(3);
  });
});
