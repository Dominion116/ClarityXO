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
