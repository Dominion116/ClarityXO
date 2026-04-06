;; 
;;  ClarityXO  GAME CONTRACT
;;  clarity-xo-game.clar
;;
;;  Responsibilities:
;;     Multi-session tic-tac-toe (one active game per player at a time)
;;     On-chain AI opponent (same priority algorithm as original)
;;     Monthly points ledger: win=3, draw=1, loss=0
;;     Read-only helpers the NFT contract and frontend rely on
;;
;;  NOT in this contract:
;;     NFT minting / claiming (see clarity-xo-trophy.clar)
;; 


;; 
;;  CONSTANTS
;; 

(define-constant contract-owner tx-sender)

;; Errors
(define-constant err-not-authorized   (err u100))
(define-constant err-game-finished    (err u101))
(define-constant err-invalid-move     (err u102))
(define-constant err-not-your-turn    (err u103))
(define-constant err-cell-occupied    (err u104))
(define-constant err-no-active-game   (err u105))
(define-constant err-game-in-progress (err u106))

;; Cell values
(define-constant EMPTY    u0)
(define-constant PLAYER_X u1)
(define-constant PLAYER_O u2)

;; Game status
(define-constant STATUS_ACTIVE u0)
(define-constant STATUS_X_WON  u1)
(define-constant STATUS_O_WON  u2)
(define-constant STATUS_DRAW   u3)

;; Points
(define-constant PTS_WIN  u3)
(define-constant PTS_DRAW u1)
(define-constant PTS_LOSS u0)

;; ~1 block per 10 min  ~4320 blocks per month (30 days)
(define-constant BLOCKS_PER_MONTH u4320)


;; 
;;  GAME STATE  (keyed by game-id)
;; 

(define-data-var next-game-id uint u1)

(define-map game-boards   uint (list 9 uint))
(define-map game-statuses uint uint)
(define-map game-players  uint principal)
(define-map game-moves    uint uint)
(define-map game-month    uint uint)   ;; month-id the game was started in

;; One active game per player
(define-map player-active-game principal uint)


;; 
;;  MONTHLY LEADERBOARD
;; 

(define-map monthly-stats
  { month: uint, player: principal }
  { pts: uint, wins: uint, draws: uint, losses: uint }
)

(define-map month-totals
  uint
  { games: uint, total-pts: uint }
)


;; 
;;  READ-ONLY  month helpers
;; 

(define-read-only (current-month)
  (/ burn-block-height BLOCKS_PER_MONTH)
)

(define-read-only (get-monthly-stats (month uint) (player principal))
  (default-to
    { pts: u0, wins: u0, draws: u0, losses: u0 }
    (map-get? monthly-stats { month: month, player: player })
  )
)

(define-read-only (get-my-stats-this-month (player principal))
  (get-monthly-stats (current-month) player)
)

(define-read-only (get-month-totals (month uint))
  (default-to { games: u0, total-pts: u0 } (map-get? month-totals month))
)


;; 
;;  READ-ONLY  game helpers
;; 

(define-read-only (get-game-board (game-id uint))
  (ok (default-to
        (list u0 u0 u0 u0 u0 u0 u0 u0 u0)
        (map-get? game-boards game-id)))
)

(define-read-only (get-game-status (game-id uint))
  (ok (default-to STATUS_ACTIVE (map-get? game-statuses game-id)))
)

(define-read-only (get-game-moves (game-id uint))
  (ok (default-to u0 (map-get? game-moves game-id)))
)

(define-read-only (get-active-game (player principal))
  (ok (map-get? player-active-game player))
)

(define-read-only (get-next-game-id)
  (ok (var-get next-game-id))
)

(define-read-only (get-full-game-state (game-id uint))
  (ok {
    board:  (default-to (list u0 u0 u0 u0 u0 u0 u0 u0 u0)
                        (map-get? game-boards   game-id)),
    status: (default-to STATUS_ACTIVE
                        (map-get? game-statuses game-id)),
    moves:  (default-to u0
                        (map-get? game-moves    game-id)),
    player: (map-get? game-players game-id),
    month:  (default-to u0
                        (map-get? game-month    game-id)),
  })
)


;; 
;;  PRIVATE  board helpers
;; 

(define-private (get-index (row uint) (col uint))
  (+ (* row u3) col)
)

(define-private (get-cell-at (board (list 9 uint)) (idx uint))
  (default-to EMPTY (element-at board idx))
)

(define-private (set-cell-in (board (list 9 uint)) (idx uint) (value uint))
  (list
    (if (is-eq idx u0) value (get-cell-at board u0))
    (if (is-eq idx u1) value (get-cell-at board u1))
    (if (is-eq idx u2) value (get-cell-at board u2))
    (if (is-eq idx u3) value (get-cell-at board u3))
    (if (is-eq idx u4) value (get-cell-at board u4))
    (if (is-eq idx u5) value (get-cell-at board u5))
    (if (is-eq idx u6) value (get-cell-at board u6))
    (if (is-eq idx u7) value (get-cell-at board u7))
    (if (is-eq idx u8) value (get-cell-at board u8))
  )
)

(define-private (check-line (a uint) (b uint) (c uint))
  (and (is-eq a b) (is-eq b c) (not (is-eq a EMPTY)))
)

(define-private (check-winner-on (board (list 9 uint)))
  (let (
    (c0 (get-cell-at board u0)) (c1 (get-cell-at board u1)) (c2 (get-cell-at board u2))
    (c3 (get-cell-at board u3)) (c4 (get-cell-at board u4)) (c5 (get-cell-at board u5))
    (c6 (get-cell-at board u6)) (c7 (get-cell-at board u7)) (c8 (get-cell-at board u8))
  )
    (if (check-line c0 c1 c2) c0
    (if (check-line c3 c4 c5) c3
    (if (check-line c6 c7 c8) c6
    (if (check-line c0 c3 c6) c0
    (if (check-line c1 c4 c7) c1
    (if (check-line c2 c5 c8) c2
    (if (check-line c0 c4 c8) c0
    (if (check-line c2 c4 c6) c2
    EMPTY))))))))
  )
)


;; 
;;  PRIVATE  AI helpers
;; 

(define-private (would-win-on (board (list 9 uint)) (index uint) (player uint))
  (is-eq (check-winner-on (set-cell-in board index player)) player)
)

(define-private (winning-fold-helper
    (index uint)
    (acc   { board: (list 9 uint), player: uint, result: uint }))
  (if (and
        (is-eq (get result acc) u999)
        (is-eq (get-cell-at (get board acc) index) EMPTY)
        (would-win-on (get board acc) index (get player acc)))
    { board: (get board acc), player: (get player acc), result: index }
    acc
  )
)

(define-private (find-winning-move-on (board (list 9 uint)) (player uint))
  (get result
    (fold winning-fold-helper
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8)
      { board: board, player: player, result: u999 }
    )
  )
)

(define-private (empty-fold-helper
    (index uint)
    (acc   { board: (list 9 uint), result: uint }))
  (if (and
        (is-eq (get result acc) u999)
        (is-eq (get-cell-at (get board acc) index) EMPTY))
    { board: (get board acc), result: index }
    acc
  )
)

(define-private (find-first-empty-corners (board (list 9 uint)))
  (get result
    (fold empty-fold-helper
      (list u0 u2 u6 u8)
      { board: board, result: u999 }
    )
  )
)

(define-private (find-first-empty-edges (board (list 9 uint)))
  (get result
    (fold empty-fold-helper
      (list u1 u3 u5 u7)
      { board: board, result: u999 }
    )
  )
)

(define-private (choose-ai-move-on (board (list 9 uint)))
  (let (
    (win-move   (find-winning-move-on board PLAYER_O))
    (block-move (find-winning-move-on board PLAYER_X))
  )
    (if (not (is-eq win-move u999))   win-move
    (if (not (is-eq block-move u999)) block-move
    (if (is-eq (get-cell-at board u4) EMPTY) u4
    (let ((corner (find-first-empty-corners board)))
      (if (not (is-eq corner u999)) corner
          (find-first-empty-edges board))
    ))))
  )
)


;; 
;;  PRIVATE  record points
;; 

(define-private (record-points (player principal) (pts uint) (outcome (string-ascii 4)))
  (let (
    (month (current-month))
    (cur   (get-monthly-stats month player))
    (mtot  (get-month-totals  month))
  )
    (map-set monthly-stats
      { month: month, player: player }
      {
        pts:    (+ (get pts    cur) pts),
        wins:   (+ (get wins   cur) (if (is-eq outcome "win")  u1 u0)),
        draws:  (+ (get draws  cur) (if (is-eq outcome "draw") u1 u0)),
        losses: (+ (get losses cur) (if (is-eq outcome "loss") u1 u0)),
      }
    )
    (map-set month-totals month
      {
        games:     (+ (get games     mtot) u1),
        total-pts: (+ (get total-pts mtot) pts),
      }
    )
  )
)


;; 
;;  PUBLIC  start-game
;; 

(define-public (start-game)
  (let (
    (player  tx-sender)
    (game-id (var-get next-game-id))
  )
    ;; Only one active game per player
    (asserts! (is-none (map-get? player-active-game player)) err-game-in-progress)

    (map-set game-boards   game-id (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
    (map-set game-statuses game-id STATUS_ACTIVE)
    (map-set game-players  game-id player)
    (map-set game-moves    game-id u0)
    (map-set game-month    game-id (current-month))
    (map-set player-active-game player game-id)

    (var-set next-game-id (+ game-id u1))
    (ok game-id)
  )
)


;; 
;;  PUBLIC  make-move
;;  Returns { game-id, status, ai-move }
;;  ai-move = u999 when the game ended before the AI played
;; 

(define-public (make-move (row uint) (col uint))
  (let (
    (player  tx-sender)
    (gid-opt (map-get? player-active-game player))
  )
    (asserts! (is-some gid-opt) err-no-active-game)

    (let (
      (game-id (unwrap-panic gid-opt))
      (board   (default-to (list u0 u0 u0 u0 u0 u0 u0 u0 u0)
                            (map-get? game-boards   game-id)))
      (status  (default-to STATUS_ACTIVE
                            (map-get? game-statuses game-id)))
      (moves   (default-to u0 (map-get? game-moves game-id)))
      (idx     (get-index row col))
    )
      (asserts! (is-eq status STATUS_ACTIVE)          err-game-finished)
      (asserts! (and (< row u3) (< col u3))           err-invalid-move)
      (asserts! (is-eq (get-cell-at board idx) EMPTY) err-cell-occupied)

      (let (
        (board-x  (set-cell-in board idx PLAYER_X))
        (moves-x  (+ moves u1))
        (winner-x (check-winner-on board-x))
      )
        ;;  Player wins 
        (if (is-eq winner-x PLAYER_X)
          (begin
            (map-set game-boards   game-id board-x)
            (map-set game-moves    game-id moves-x)
            (map-set game-statuses game-id STATUS_X_WON)
            (map-delete player-active-game player)
            (record-points player PTS_WIN "win")
            (ok { game-id: game-id, status: STATUS_X_WON, ai-move: u999 })
          )
          ;;  Draw after player move 
          (if (is-eq moves-x u9)
            (begin
              (map-set game-boards   game-id board-x)
              (map-set game-moves    game-id moves-x)
              (map-set game-statuses game-id STATUS_DRAW)
              (map-delete player-active-game player)
              (record-points player PTS_DRAW "draw")
              (ok { game-id: game-id, status: STATUS_DRAW, ai-move: u999 })
            )
            ;;  AI move 
            (let (
              (ai-idx   (choose-ai-move-on board-x))
              (board-o  (set-cell-in board-x ai-idx PLAYER_O))
              (moves-o  (+ moves-x u1))
              (winner-o (check-winner-on board-o))
            )
              ;; AI wins
              (if (is-eq winner-o PLAYER_O)
                (begin
                  (map-set game-boards   game-id board-o)
                  (map-set game-moves    game-id moves-o)
                  (map-set game-statuses game-id STATUS_O_WON)
                  (map-delete player-active-game player)
                  (record-points player PTS_LOSS "loss")
                  (ok { game-id: game-id, status: STATUS_O_WON, ai-move: ai-idx })
                )
                ;; Draw after AI move
                (if (is-eq moves-o u9)
                  (begin
                    (map-set game-boards   game-id board-o)
                    (map-set game-moves    game-id moves-o)
                    (map-set game-statuses game-id STATUS_DRAW)
                    (map-delete player-active-game player)
                    (record-points player PTS_DRAW "draw")
                    (ok { game-id: game-id, status: STATUS_DRAW, ai-move: ai-idx })
                  )
                  ;; Game continues
                  (begin
                    (map-set game-boards game-id board-o)
                    (map-set game-moves  game-id moves-o)
                    (ok { game-id: game-id, status: STATUS_ACTIVE, ai-move: ai-idx })
                  )
                )
              )
            )
          )
        )
      )
    )
  )
)


;; 
;;  PUBLIC  resign-game
;; 

(define-public (resign-game)
  (let (
    (player  tx-sender)
    (gid-opt (map-get? player-active-game player))
  )
    (asserts! (is-some gid-opt) err-no-active-game)
    (let ((game-id (unwrap-panic gid-opt)))
      (map-set game-statuses game-id STATUS_O_WON)
      (map-delete player-active-game player)
      (record-points player PTS_LOSS "loss")
      (ok game-id)
    )
  )
)
