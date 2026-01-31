// ClarityXO Tic-Tac-Toe Contract Tests
// Note: Clarinet 3.0+ doesn't have a built-in test runner
// Use 'clarinet console' to manually test these scenarios

// Test Scenarios:

// 1. Start a new game
// (contract-call? .tictactoe start-new-game)
// Expected: (ok true)

// 2. Check initial board state (all zeros)
// (contract-call? .tictactoe get-board-state)
// Expected: (ok (list u0 u0 u0 u0 u0 u0 u0 u0 u0))

// 3. Make a valid move at position (0, 0)
// (contract-call? .tictactoe make-move u0 u0)
// Expected: (ok true) and computer makes counter-move

// 4. Check game status
// (contract-call? .tictactoe get-game-status)
// Expected: (ok u0) for active game

// 5. Check current turn
// (contract-call? .tictactoe get-current-turn)
// Expected: (ok u1) for player X or (ok u2) for computer O

// 6. Try invalid move on occupied cell
// (contract-call? .tictactoe make-move u0 u0)
// Expected: (err u104) - cell occupied error

// 7. Try invalid move out of bounds
// (contract-call? .tictactoe make-move u3 u3)
// Expected: (err u102) - invalid move error

// 8. Test win condition (three in a row)
// Start new game, then:
// (contract-call? .tictactoe make-move u0 u0)
// (contract-call? .tictactoe make-move u1 u0)
// (contract-call? .tictactoe make-move u2 u0)
// Check status: (contract-call? .tictactoe get-game-status)
// Expected: (ok u1) if X won

// 9. Test resign functionality
// (contract-call? .tictactoe resign-game)
// Expected: (ok true) and status becomes O won

// 10. Verify is-valid-move function
// (contract-call? .tictactoe is-valid-move u1 u1)
// Expected: (ok true) for empty cell, (ok false) for occupied

// To run these tests:
// 1. Start Clarinet console: clarinet console
// 2. Copy and paste each test command
// 3. Verify the output matches expectations
