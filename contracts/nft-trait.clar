;; nft-trait.clar
;; Local SIP-009 trait stub for Clarinet testing.
;; On mainnet/testnet use the official deployed trait instead:
;;   'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait

(define-trait nft-trait
  (
    ;; Transfer token to a new owner
    (transfer (uint principal principal) (response bool uint))

    ;; Get the owner of a token
    (get-owner (uint) (response (optional principal) uint))

    ;; Get token metadata URI
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))

    ;; Get last minted token id
    (get-last-token-id () (response uint uint))
  )
)
