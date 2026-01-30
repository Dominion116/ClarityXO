import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

describe("ClarityXO Tic-Tac-Toe Contract Tests", () => {
  it("should start a new game successfully", () => {
    const { result } = simnet.callPublicFn(
      "tictactoe",
      "start-new-game",
      [],
      address1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should return empty board initially", () => {
    simnet.callPublicFn("tictactoe", "start-new-game", [], address1);
    
    const { result } = simnet.callReadOnlyFn(
      "tictactoe",
      "get-board-state",
      [],
      address1
    );
    
    expect(result).toBeOk(
      Cl.list([
        Cl.uint(0), Cl.uint(0), Cl.uint(0),
        Cl.uint(0), Cl.uint(0), Cl.uint(0),
        Cl.uint(0), Cl.uint(0), Cl.uint(0)
      ])
    );
  });

  it("should allow player to make a valid move", () => {
    simnet.callPublicFn("tictactoe", "start-new-game", [], address1);
    
    const { result } = simnet.callPublicFn(
      "tictactoe",
      "make-move",
      [Cl.uint(0), Cl.uint(0)],
      address1
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should detect win condition", () => {
    simnet.callPublicFn("tictactoe", "start-new-game", [], address1);
    
    // Make moves to create a winning scenario
    simnet.callPublicFn("tictactoe", "make-move", [Cl.uint(0), Cl.uint(0)], address1);
    simnet.callPublicFn("tictactoe", "make-move", [Cl.uint(1), Cl.uint(0)], address1);
    simnet.callPublicFn("tictactoe", "make-move", [Cl.uint(2), Cl.uint(0)], address1);
    
    const { result } = simnet.callReadOnlyFn(
      "tictactoe",
      "get-game-status",
      [],
      address1
    );
    
    // Status should not be active (0) after win
    expect(result).toBeOk(Cl.uint(1)); // X won
  });
});
