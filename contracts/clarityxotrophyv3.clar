;;
;;  ClarityXO TROPHY NFT CONTRACT - v3
;;  clarityxotrophyv3.clar
;;
;;  Changes over v2:
;;    - month-uri map: owner can set a distinct base URI per calendar month
;;      so each month's NFT collection resolves to its own image set
;;    - get-token-uri resolves month-specific URI first, falls back to base-uri
;;    - set-month-uri admin function to configure per-month images
;;    - get-month-uri read-only to inspect what URI a month resolves to
;;


;;
;;  TRAIT IMPLEMENTATION (SIP-009)
;;

(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token clarityxotrophyv3 uint)


;;
;;  CONSTANTS
;;

(define-constant contract-owner tx-sender)

(define-constant err-not-authorized  (err u100))
(define-constant err-not-whitelisted (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-month-not-over  (err u103))
(define-constant err-bad-fee         (err u104))
(define-constant err-transfer-failed (err u105))
(define-constant err-not-token-owner (err u106))

;; STX mint fee in micro-STX paid to the contract owner on each claim.
;; Default: 0.5 STX.  Owner can update via set-mint-fee.
(define-data-var mint-fee uint u500000)

;; ~4320 Bitcoin blocks per month (30 d x 24 h x 6 blocks/h)
(define-constant BLOCKS_PER_MONTH u4320)

;; Global sequential token counter
(define-data-var last-token-id uint u0)

;; Fallback base metadata URI used for any month that has no month-specific URI set
(define-data-var base-uri (string-ascii 80) "https://clarityxo.xyz/nft/")


;;
;;  STORAGE
;;

;; month-id -> list of up to 5 whitelisted principals
(define-map month-winners uint (list 5 principal))

;; (month, player) -> claimed?
(define-map claimed
  { month: uint, player: principal }
  bool
)

;; token-id -> lightweight on-chain metadata
(define-map trophy-meta
  uint
  { month: uint, rank: uint, player: principal }
)

;; Per-month base URI override.
;; When set for a month, get-token-uri uses this instead of base-uri.
;; Format: any reachable prefix such as "https://clarityxo.xyz/nft/may2026/"
;;         or an IPFS gateway "https://ipfs.io/ipfs/<CID>/"
(define-map month-uri uint (string-ascii 80))


;;
;;  READ-ONLY HELPERS
;;

(define-read-only (current-month)
  (/ burn-block-height BLOCKS_PER_MONTH)
)

(define-read-only (get-mint-fee)
  (ok (var-get mint-fee))
)

(define-read-only (get-base-uri)
  (ok (var-get base-uri))
)

(define-read-only (get-contract-owner)
  (ok contract-owner)
)

;; Return the per-month URI for a given month, or none if not set
(define-read-only (get-month-uri (month uint))
  (ok (map-get? month-uri month))
)

(define-read-only (get-month-winners (month uint))
  (ok (map-get? month-winners month))
)

(define-read-only (get-month-winners-or-empty (month uint))
  (ok (default-to (list) (map-get? month-winners month)))
)

(define-read-only (has-claimed (month uint) (player principal))
  (ok (default-to false (map-get? claimed { month: month, player: player })))
)

(define-read-only (can-claim (month uint) (player principal))
  (let (
    (rank-opt (unwrap-panic (get-player-rank month player)))
    (already  (map-get? claimed { month: month, player: player }))
  )
    (ok (and (< month (current-month)) (is-some rank-opt) (is-none already)))
  )
)

(define-read-only (get-trophy-meta (token-id uint))
  (ok (map-get? trophy-meta token-id))
)

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


;;
;;  OWNER - admin functions
;;

(define-public (set-month-winners (month uint) (winners (list 5 principal)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (< month (current-month)) err-month-not-over)
    (map-set month-winners month winners)
    (ok true)
  )
)

(define-public (set-mint-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (var-set mint-fee new-fee)
    (ok new-fee)
  )
)

;; Update the global fallback base URI
(define-public (set-base-uri (new-uri (string-ascii 80)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (var-set base-uri new-uri)
    (ok new-uri)
  )
)

;; Set or update the base URI for a specific month's NFT images.
;; Call this BEFORE or AFTER set-month-winners - order doesn't matter.
;; Example: (set-month-uri u220 "https://clarityxo.xyz/nft/may2026/")
;;          (set-month-uri u220 "https://ipfs.io/ipfs/Qm.../")
(define-public (set-month-uri (month uint) (uri (string-ascii 80)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (map-set month-uri month uri)
    (ok uri)
  )
)


;;
;;  PUBLIC - claim-trophy
;;
;;  Steps:
;;    1. Month must be over (< current-month).
;;    2. Caller must be in that month's whitelist.
;;    3. Caller must not have already claimed.
;;    4. Caller pays mint-fee in STX to the contract owner.
;;

(define-public (claim-trophy (month uint))
  (let (
    (player   tx-sender)
    (fee      (var-get mint-fee))
    (rank-opt (unwrap-panic (get-player-rank month player)))
  )
    (asserts! (< month (current-month)) err-month-not-over)
    (asserts! (is-some rank-opt) err-not-whitelisted)
    (asserts!
      (is-none (map-get? claimed { month: month, player: player }))
      err-already-claimed)

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
          (nft-mint? clarityxotrophyv3 token-id player)
        )
      error err-transfer-failed
    )
  )
)


;;
;;  SIP-009 INTERFACE
;;

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; Resolve: if trophy-meta exists for this token, look up its month in
;; month-uri.  If a month-specific URI is set, use it; otherwise fall
;; back to the global base-uri.  For unminted tokens, return base-uri + id.
(define-read-only (get-token-uri (token-id uint))
  (let (
    (base
      (match (map-get? trophy-meta token-id)
        meta (default-to (var-get base-uri) (map-get? month-uri (get month meta)))
        (var-get base-uri)
      )
    )
  )
    (ok (some (concat base (int-to-ascii token-id))))
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? clarityxotrophyv3 token-id))
)

(define-public (transfer
    (token-id  uint)
    (sender    principal)
    (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (is-some (nft-get-owner? clarityxotrophyv3 token-id)) err-not-token-owner)
    (asserts!
      (is-eq (nft-get-owner? clarityxotrophyv3 token-id) (some sender))
      err-not-token-owner)
    (nft-transfer? clarityxotrophyv3 token-id sender recipient)
  )
)
