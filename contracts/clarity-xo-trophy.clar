;; ═══════════════════════════════════════════════════════════════════════════
;;  ClarityXO — TROPHY NFT CONTRACT
;;  clarity-xo-trophy.clar
;;
;;  Responsibilities:
;;    · SIP-009 compliant NFT (clarity-xo-trophy)
;;    · Owner takes a monthly snapshot, whitelists the top-5 players
;;      for that month via `set-month-winners`
;;    · Each whitelisted player claims their own NFT by calling
;;      `claim-trophy`, paying a small STX mint fee to the owner
;;    · One trophy per player per month — no double claims
;;
;;  Deploy AFTER clarity-xo-game.clar.
;;  Replace GAME_CONTRACT_PRINCIPAL below with the deployed address.
;; ═══════════════════════════════════════════════════════════════════════════


;; ───────────────────────────────────────────────────────────────────────────
;;  TRAIT IMPLEMENTATION  (SIP-009)
;; ───────────────────────────────────────────────────────────────────────────

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token clarity-xo-trophy uint)


;; ───────────────────────────────────────────────────────────────────────────
;;  CONSTANTS
;; ───────────────────────────────────────────────────────────────────────────

(define-constant contract-owner tx-sender)

;; Errors
(define-constant err-not-authorized  (err u100))
(define-constant err-not-whitelisted (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-month-not-over  (err u103))
(define-constant err-bad-fee         (err u104))
(define-constant err-transfer-failed (err u105))
(define-constant err-not-token-owner (err u106))

;; STX mint fee in micro-STX (0.5 STX = 500_000 uSTX)
;; Owner can update this via set-mint-fee
(define-data-var mint-fee uint u500000)

;; ~4320 blocks per month (30 days × 24 h × 6 blocks/h)
(define-constant BLOCKS_PER_MONTH u4320)

;; Token counter
(define-data-var last-token-id uint u0)

;; Base metadata URI — swap for your IPFS/Arweave gateway
(define-data-var base-uri (string-ascii 80) "https://clarityxo.xyz/nft/")


;; ───────────────────────────────────────────────────────────────────────────
;;  STORAGE
;; ───────────────────────────────────────────────────────────────────────────

;; month-id → list of up to 5 whitelisted principals (set by owner)
(define-map month-winners uint (list 5 principal))

;; tracks whether a player has claimed their trophy for a given month
(define-map claimed
  { month: uint, player: principal }
  bool
)

;; trophy metadata stored on-chain (optional, lightweight)
(define-map trophy-meta
  uint
  { month: uint, rank: uint, player: principal }
)


;; ───────────────────────────────────────────────────────────────────────────
;;  READ-ONLY HELPERS
;; ───────────────────────────────────────────────────────────────────────────

(define-read-only (current-month)
  (/ burn-block-height BLOCKS_PER_MONTH)
)

(define-read-only (get-mint-fee)
  (ok (var-get mint-fee))
)

(define-read-only (get-month-winners (month uint))
  (ok (map-get? month-winners month))
)

(define-read-only (has-claimed (month uint) (player principal))
  (ok (default-to false (map-get? claimed { month: month, player: player })))
)

(define-read-only (get-trophy-meta (token-id uint))
  (ok (map-get? trophy-meta token-id))
)

;; Return the 0-based position (rank) of a player in a given month's
;; whitelist, or none if not found
(define-read-only (get-player-rank (month uint) (player principal))
  (let ((winners (default-to (list) (map-get? month-winners month))))
    (ok
      (if (is-eq (element-at winners u0) (some player)) (some u1)
      (if (is-eq (element-at winners u1) (some player)) (some u2)
      (if (is-eq (element-at winners u2) (some player)) (some u3)
      (if (is-eq (element-at winners u3) (some player)) (some u4)
      (if (is-eq (element-at winners u4) (some player)) (some u5)
      none)))))
    )
  )
)

(define-read-only (is-eligible (month uint) (player principal))
  (let ((rank-opt (unwrap-panic (get-player-rank month player))))
    (ok (is-some rank-opt))
  )
)


;; ───────────────────────────────────────────────────────────────────────────
;;  OWNER — admin functions
;; ───────────────────────────────────────────────────────────────────────────

;; Called by owner at end of each month after reading the game contract's
;; monthly-stats map off-chain and determining the top 5.
;; The month supplied must be a past month (< current-month).
(define-public (set-month-winners (month uint) (winners (list 5 principal)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    ;; Month must already be over
    (asserts! (< month (current-month)) err-month-not-over)
    (map-set month-winners month winners)
    (ok true)
  )
)

;; Owner can update the STX mint fee at any time
(define-public (set-mint-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (var-set mint-fee new-fee)
    (ok new-fee)
  )
)

;; Owner can update the base metadata URI
(define-public (set-base-uri (new-uri (string-ascii 80)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (var-set base-uri new-uri)
    (ok new-uri)
  )
)


;; ───────────────────────────────────────────────────────────────────────────
;;  PUBLIC — claim-trophy
;;
;;  Called by the player themselves.
;;  Steps:
;;    1. Month must be over (< current-month).
;;    2. Caller must be in that month's whitelist.
;;    3. Caller must not have already claimed.
;;    4. Caller must transfer the mint fee in the same transaction.
;;       The fee goes directly to the contract owner.
;; ───────────────────────────────────────────────────────────────────────────

(define-public (claim-trophy (month uint))
  (let (
    (player   tx-sender)
    (fee      (var-get mint-fee))
    (rank-opt (unwrap-panic (get-player-rank month player)))
  )
    ;; Month must be over
    (asserts! (< month (current-month)) err-month-not-over)

    ;; Player must be in the whitelist
    (asserts! (is-some rank-opt) err-not-whitelisted)

    ;; No double claiming
    (asserts!
      (is-none (map-get? claimed { month: month, player: player }))
      err-already-claimed)

    ;; Collect mint fee from the caller → send to contract owner
    (match (stx-transfer? fee player contract-owner)
      success
        (let (
          (token-id (+ (var-get last-token-id) u1))
          (rank     (unwrap-panic rank-opt))
        )
          (var-set last-token-id token-id)
          (map-set claimed { month: month, player: player } true)
          (map-set trophy-meta token-id
            { month: month, rank: rank, player: player })
          (nft-mint? clarity-xo-trophy token-id player)
        )
      error err-transfer-failed
    )
  )
)


;; ───────────────────────────────────────────────────────────────────────────
;;  SIP-009 INTERFACE
;; ───────────────────────────────────────────────────────────────────────────

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  ;; Produces e.g. "https://clarityxo.xyz/nft/7"
  (ok (some (concat (var-get base-uri) (int-to-ascii token-id))))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? clarity-xo-trophy token-id))
)

(define-public (transfer
    (token-id  uint)
    (sender    principal)
    (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (is-some (nft-get-owner? clarity-xo-trophy token-id)) err-not-token-owner)
    (asserts!
      (is-eq (nft-get-owner? clarity-xo-trophy token-id) (some sender))
      err-not-token-owner)
    (nft-transfer? clarity-xo-trophy token-id sender recipient)
  )
)
