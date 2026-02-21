;; ClarityXO - Blockchain Tic-Tac-Toe Game
;; A strategic game of X's and O's on the Stacks blockchain

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-game-finished (err u101))
(define-constant err-invalid-move (err u102))
(define-constant err-not-your-turn (err u103))
(define-constant err-cell-occupied (err u104))

;; Cell values
(define-constant EMPTY u0)
(define-constant PLAYER_X u1)
(define-constant PLAYER_O u2)

;; Game status
(define-constant STATUS_ACTIVE u0)
(define-constant STATUS_X_WON u1)
(define-constant STATUS_O_WON u2)
(define-constant STATUS_DRAW u3)

;; Data Variables
(define-data-var game-board (list 9 uint) (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
(define-data-var game-status uint STATUS_ACTIVE)
(define-data-var current-turn uint PLAYER_X)
(define-data-var player-address (optional principal) none)
(define-data-var moves-count uint u0)

;; Private Functions

;; Convert row and column to index (0-8)
(define-private (get-index (row uint) (col uint))
  (+ (* row u3) col)
)

;; Get cell value at position
(define-private (get-cell (row uint) (col uint))
  (let ((idx (get-index row col)))
    (default-to EMPTY (element-at (var-get game-board) idx))
  )
)

;; Set cell value at position
(define-private (set-cell (row uint) (col uint) (value uint))
  (let ((idx (get-index row col)))
    (var-set game-board 
      (map set-cell-helper 
        (var-get game-board)
        (list u0 u1 u2 u3 u4 u5 u6 u7 u8)
        (list (if (is-eq idx u0) value (default-to EMPTY (element-at (var-get game-board) u0)))
              (if (is-eq idx u1) value (default-to EMPTY (element-at (var-get game-board) u1)))
              (if (is-eq idx u2) value (default-to EMPTY (element-at (var-get game-board) u2)))
              (if (is-eq idx u3) value (default-to EMPTY (element-at (var-get game-board) u3)))
              (if (is-eq idx u4) value (default-to EMPTY (element-at (var-get game-board) u4)))
              (if (is-eq idx u5) value (default-to EMPTY (element-at (var-get game-board) u5)))
              (if (is-eq idx u6) value (default-to EMPTY (element-at (var-get game-board) u6)))
              (if (is-eq idx u7) value (default-to EMPTY (element-at (var-get game-board) u7)))
              (if (is-eq idx u8) value (default-to EMPTY (element-at (var-get game-board) u8))))
      )
    )
  )
)

(define-private (set-cell-helper (current uint) (index uint) (new-val uint))
  new-val
)

;; Check if three cells have the same non-empty value
(define-private (check-line (a uint) (b uint) (c uint))
  (and (is-eq a b) (is-eq b c) (not (is-eq a EMPTY)))
)

;; Check all win conditions
(define-private (check-winner-internal)
  (let (
    (board (var-get game-board))
    (c0 (default-to EMPTY (element-at board u0)))
    (c1 (default-to EMPTY (element-at board u1)))
    (c2 (default-to EMPTY (element-at board u2)))
    (c3 (default-to EMPTY (element-at board u3)))
    (c4 (default-to EMPTY (element-at board u4)))
    (c5 (default-to EMPTY (element-at board u5)))
    (c6 (default-to EMPTY (element-at board u6)))
    (c7 (default-to EMPTY (element-at board u7)))
    (c8 (default-to EMPTY (element-at board u8)))
  )
    ;; Check rows
    (if (check-line c0 c1 c2) c0
    (if (check-line c3 c4 c5) c3
    (if (check-line c6 c7 c8) c6
    ;; Check columns
    (if (check-line c0 c3 c6) c0
    (if (check-line c1 c4 c7) c1
    (if (check-line c2 c5 c8) c2
    ;; Check diagonals
    (if (check-line c0 c4 c8) c0
    (if (check-line c2 c4 c6) c2
    EMPTY))))))))
  )
)

;; Check if board is full
(define-private (is-board-full)
  (is-eq (var-get moves-count) u9)
)

;; Update game status based on winner or draw
(define-private (update-game-status)
  (let ((winner (check-winner-internal)))
    (if (is-eq winner PLAYER_X)
      (var-set game-status STATUS_X_WON)
      (if (is-eq winner PLAYER_O)
        (var-set game-status STATUS_O_WON)
        (if (is-board-full)
          (var-set game-status STATUS_DRAW)
          (var-set game-status STATUS_ACTIVE)
        )
      )
    )
  )
)

;; ─── AI Helpers ───────────────────────────────────────────────────────────────

;; Check if placing `player` at `index` would complete a winning line.
;; We temporarily simulate the move on the current board values.
(define-private (would-win (index uint) (player uint))
  (let (
    (board (var-get game-board))
    (c0 (if (is-eq index u0) player (default-to EMPTY (element-at board u0))))
    (c1 (if (is-eq index u1) player (default-to EMPTY (element-at board u1))))
    (c2 (if (is-eq index u2) player (default-to EMPTY (element-at board u2))))
    (c3 (if (is-eq index u3) player (default-to EMPTY (element-at board u3))))
    (c4 (if (is-eq index u4) player (default-to EMPTY (element-at board u4))))
    (c5 (if (is-eq index u5) player (default-to EMPTY (element-at board u5))))
    (c6 (if (is-eq index u6) player (default-to EMPTY (element-at board u6))))
    (c7 (if (is-eq index u7) player (default-to EMPTY (element-at board u7))))
    (c8 (if (is-eq index u8) player (default-to EMPTY (element-at board u8))))
  )
    (or
      (check-line c0 c1 c2)
      (check-line c3 c4 c5)
      (check-line c6 c7 c8)
      (check-line c0 c3 c6)
      (check-line c1 c4 c7)
      (check-line c2 c5 c8)
      (check-line c0 c4 c8)
      (check-line c2 c4 c6)
    )
  )
)

;; Return `index` if that cell is empty, else `fallback`
(define-private (pick-if-empty (index uint) (fallback uint))
  (if (is-eq (default-to PLAYER_X (element-at (var-get game-board) index)) EMPTY)
    index
    fallback
  )
)

;; Scan a list of candidate indices; return the first one where `player` would win.
;; Uses fold; u999 is the sentinel for "none found".
(define-private (find-winning-move-for (player uint))
  (fold
    (lambda (index acc)
      (if (and (is-eq acc u999)
               (is-eq (default-to PLAYER_X (element-at (var-get game-board) index)) EMPTY)
               (would-win index player))
        index
        acc
      )
    )
    (list u0 u1 u2 u3 u4 u5 u6 u7 u8)
    u999
  )
)

;; Priority-based AI move selection:
;;   1. Win immediately
;;   2. Block opponent win
;;   3. Center
;;   4. Any corner
;;   5. Any edge
(define-private (choose-ai-move)
  (let (
    (win-move   (find-winning-move-for PLAYER_O))
    (block-move (find-winning-move-for PLAYER_X))
  )
    (if (not (is-eq win-move u999))
      win-move  ;; 1. Take the win
      (if (not (is-eq block-move u999))
        block-move  ;; 2. Block X
        ;; 3. Center
        (if (is-eq (default-to PLAYER_X (element-at (var-get game-board) u4)) EMPTY)
          u4
          ;; 4. Corners (pick first available)
          (let ((corner (fold (lambda (i acc) (if (and (is-eq acc u999) (is-eq (default-to PLAYER_X (element-at (var-get game-board) i)) EMPTY)) i acc))
                              (list u0 u2 u6 u8)
                              u999)))
            (if (not (is-eq corner u999))
              corner
              ;; 5. Edges
              (fold (lambda (i acc) (if (and (is-eq acc u999) (is-eq (default-to PLAYER_X (element-at (var-get game-board) i)) EMPTY)) i acc))
                    (list u1 u3 u5 u7)
                    u999)
            )
          )
        )
      )
    )
  )
)

;; ─── Updated make-move ────────────────────────────────────────────────────────

(define-public (make-move (row uint) (col uint))
  (let (
    (current-cell (get-cell row col))
    (status (var-get game-status))
  )
    (begin
      (asserts! (is-eq status STATUS_ACTIVE) err-game-finished)
      (asserts! (is-eq (var-get current-turn) PLAYER_X) err-not-your-turn)
      (asserts! (and (< row u3) (< col u3)) err-invalid-move)
      (asserts! (is-eq current-cell EMPTY) err-cell-occupied)

      ;; Player move
      (set-cell row col PLAYER_X)
      (var-set moves-count (+ (var-get moves-count) u1))
      (var-set current-turn PLAYER_O)
      (update-game-status)

      ;; AI move (only if game still active)
      (if (is-eq (var-get game-status) STATUS_ACTIVE)
        (let (
          (ai-idx  (choose-ai-move))
          (ai-row  (/ ai-idx u3))
          (ai-col  (mod ai-idx u3))
        )
          (begin
            (set-cell ai-row ai-col PLAYER_O)
            (var-set moves-count (+ (var-get moves-count) u1))
            (var-set current-turn PLAYER_X)
            (update-game-status)
            (ok true)
          )
        )
        (ok true)
      )
    )
  )
)

;; Player resigns
(define-public (resign-game)
  (begin
    (asserts! (is-eq (some tx-sender) (var-get player-address)) err-not-authorized)
    (var-set game-status STATUS_O_WON)
    (ok true)
  )
)

;; Read-Only Functions

;; Get current board state
(define-read-only (get-board-state)
  (ok (var-get game-board))
)

;; Get game status
(define-read-only (get-game-status)
  (ok (var-get game-status))
)

;; Get winner
(define-read-only (get-winner)
  (let ((status (var-get game-status)))
    (ok (if (is-eq status STATUS_X_WON)
          (some PLAYER_X)
          (if (is-eq status STATUS_O_WON)
            (some PLAYER_O)
            none
          )
        ))
  )
)

;; Get current turn
(define-read-only (get-current-turn)
  (ok (var-get current-turn))
)

;; Check if move is valid
(define-read-only (is-valid-move (row uint) (col uint))
  (let (
    (current-cell (get-cell row col))
    (status (var-get game-status))
  )
    (ok (and 
      (is-eq status STATUS_ACTIVE)
      (is-eq (var-get current-turn) PLAYER_X)
      (< row u3)
      (< col u3)
      (is-eq current-cell EMPTY)
    ))
  )
)

;; Get player address
(define-read-only (get-player-address)
  (ok (var-get player-address))
)

;; Get moves count
(define-read-only (get-moves-count)
  (ok (var-get moves-count))
)
