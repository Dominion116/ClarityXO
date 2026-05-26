// Smoke test — confirms the test runner is wired up correctly.
import { describe, it, expect } from "vitest";

describe("test runner", () => {
  it("executes a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("recognises truthy values", () => {
    expect(true).toBeTruthy();
    expect(1).toBeTruthy();
    expect("hello").toBeTruthy();
  });

  it("recognises falsy values", () => {
    expect(false).toBeFalsy();
    expect(0).toBeFalsy();
    expect("").toBeFalsy();
  });
});
