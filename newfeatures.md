# ClarityXO — New Features & Test Roadmap

Features listed roughly from highest impact to lowest.
We tackle one at a time.

---

## Player vs Player (PvP) Mode ✅ SHIPPED

**What:** Two wallet holders challenge and play each other on-chain instead of against the AI.
One player creates a challenge, the other accepts. Each move is a real transaction signed by the correct player.

**Why it matters:** The biggest gap in the app right now. Every other blockchain game has PvP; ClarityXO being solo-only limits its social ceiling and replay value significantly.

**What it involves:**
- New Clarity contract functions: `create-challenge`, `accept-challenge`, `make-pvp-move`
- A "challenges" map keyed by challenger principal, storing the opponent and game state
- Frontend: Challenge lobby UI — create/accept/decline a challenge via wallet address or BNS name
- Leaderboard: PvP wins could carry a separate point multiplier (e.g. win=5 pts vs AI win=3 pts)

---

## Season Archive (Historical Leaderboard)

**What:** View the leaderboard for any past month — who won, their scores, and whether NFTs were claimed.
Currently only the current month is visible; past data is inaccessible from the UI.

**Why it matters:** Gives the monthly competition a "hall of fame" feel. Players have a reason to care about historical performance and can verify NFT legitimacy.

**What it involves:**
- Backend: Store each month's final snapshot when the month ends; expose `GET /api/leaderboard?month=YYYY-MM`
- Frontend: Month selector dropdown on the Leaderboard page (list only months with data)
- Mark past months' NFT claimants with a trophy badge next to their name
- No contract changes needed — the `monthly-stats` map already keys by month

**Commits plan (~18 commits):**
- Add `availableMonths` endpoint to backend
- Add month-keyed leaderboard snapshot storage in MongoDB
- Add month selector state to Leaderboard component
- Render month dropdown with available months list
- Fetch leaderboard by selected month
- Style the month picker dropdown
- Add trophy badge to rows for NFT claimants
- Add "Current Month" default selection
- Add loading skeleton while fetching past month data
- Add empty state for months with no data
- Tests: backend month endpoint unit tests
- Tests: leaderboard month fetching logic
- Tests: trophy badge render condition
- Add month picker to mobile layout
- Add keyboard navigation to month picker
- Add URL search param for deep-linkable month
- Scroll to top on month change
- Add "View Trophy Holders" link for past months

---

## Win Streak & All-Time Stats

**What:** Track each player's current win streak and all-time record (total wins / draws / losses across all months).
Display on the Game page next to the wallet badge and on the player's leaderboard row.

**Why it matters:** Monthly points reset every 30 days. All-time stats give long-term players something permanent to show for their effort and create a reason to log in daily.

**What it involves:**
- Backend: Aggregate across all stored monthly records per player address for all-time totals
- New `GET /api/player/:address/stats` endpoint returning `{ allTimeWins, allTimeDraws, allTimeLosses, currentStreak, bestStreak }`
- Streak is broken by any loss; draw does not reset it
- Frontend: Small stats strip below the wallet bar in Game.jsx; full breakdown on a player profile modal

**Commits plan (~22 commits):**
- Add player stats aggregation function in backend
- Add `GET /api/player/:address/stats` route
- Compute `allTimeWins`, `allTimeDraws`, `allTimeLosses` from monthly records
- Compute `currentStreak` from ordered game results
- Compute `bestStreak` from all-time game history
- Add player stats schema to MongoDB
- Add streak update logic on game result write
- Add `fetchPlayerStats` utility in frontend
- Add `usePlayerStats` hook in frontend
- Render stats strip below wallet bar in Game.jsx
- Add wins / draws / losses counters to stats strip
- Add streak fire indicator (e.g. 🔥 for streak ≥ 3)
- Add best-streak badge on leaderboard row
- Add all-time stats to leaderboard table columns
- Style stats strip with neomorphic design
- Add loading state to stats strip
- Add error fallback when player has no stats
- Tests: streak computation with zero losses
- Tests: streak breaks correctly on loss
- Tests: all-time aggregation across multiple months
- Tests: `GET /api/player/:address/stats` returns correct shape
- Tests: stats strip renders with mock data

---

## Sound Effects

**What:** Subtle audio cues — a soft click on move placement, a rising chime on win, a flat tone on loss, a neutral sound on draw.
Fully optional with a mute toggle that persists to localStorage.

**Why it matters:** Sound is the fastest way to make a game feel alive. The neomorphic design already has a tactile feel; audio completes that.

**What it involves:**
- Small set of synthesised tones via the Web Audio API (no audio file dependencies)
- `useSoundEffects` hook wired into `makeMove`, result detection in `App.jsx`
- Mute button in the game header (speaker icon)

**Commits plan (~16 commits):**
- Create `useSoundEffects` hook file
- Add Web Audio context initialization with lazy start
- Add `playClick` function with short pluck tone
- Add `playWin` function with ascending arpeggio
- Add `playLoss` function with descending minor tone
- Add `playDraw` function with flat neutral tone
- Add `playChallengeSent` function for PvP challenge
- Add `playChallengeReceived` function for incoming challenge
- Wire `playClick` into cell click handler in Game.jsx
- Wire `playWin`/`playLoss`/`playDraw` into game result detection
- Add mute state with localStorage persistence to hook
- Export `isMuted` and `toggleMute` from hook
- Add mute toggle button to game header
- Style mute toggle button (speaker/muted icon swap)
- Tests: mute state initialises from localStorage
- Tests: toggle mute writes to localStorage

---

## Share Your Game (Social Card)

**What:** After a win (or any game end), a "Share" button appears that copies a pre-built tweet / Warpcast post to the clipboard:
`"I just beat ClarityXO on-chain 🎮 Rank #3 this month with 27 pts — play me at clarityxo.xyz"`

**Why it matters:** Organic growth. On-chain games are a natural fit for crypto-native social feeds. One share = potential new player.

**What it involves:**
- `generateShareText(outcome, rank, pts, bnsName)` utility in a new `share.js`
- A "Share" button that appears in the game result state (alongside New Game / Resign)
- Optional: `canvas`-rendered board image that can be downloaded or embedded in the share

**Commits plan (~20 commits):**
- Create `frontend/src/utils/share.js`
- Add `generateShareText` for win outcome
- Add `generateShareText` for draw outcome
- Add `generateShareText` for loss outcome
- Add `generateShareText` for PvP win outcome
- Add clipboard copy utility with async fallback
- Add `Share` button to game result view in Game.jsx
- Show share button only after game ends
- Add copy-to-clipboard feedback ("Copied!")
- Add Warpcast deep-link option
- Add Twitter/X share link option
- Create `BoardCanvas` utility for canvas board render
- Draw board grid on canvas
- Draw X/O markers on canvas
- Draw win-line overlay on canvas
- Export board image as PNG download
- Wire board image to share flow
- Tests: `generateShareText` win output
- Tests: `generateShareText` draw output
- Tests: clipboard copy returns correct text

---

## Progressive Web App (PWA)

**What:** Make ClarityXO installable as a standalone app on desktop and mobile. The AI-only game mode already works without a wallet — a service worker would cache assets so the board loads instantly even on a slow connection.

**Why it matters:** Mobile users who play the AI can get a native-app feel. The install prompt is a strong retention hook.

**What it involves:**
- `vite-plugin-pwa` with a Workbox cache strategy for JS/CSS/font assets
- `manifest.json` with icons, theme colour, and `display: standalone`
- Offline fallback page that renders the game board for AI-only play
- No contract or backend changes

**Commits plan (~15 commits):**
- Install `vite-plugin-pwa` dependency
- Add PWA plugin config to `vite.config.js`
- Create `public/manifest.json` with app metadata
- Add theme colour and background colour to manifest
- Add icon set (192×192 and 512×512 placeholder SVGs)
- Add `display: standalone` and start URL to manifest
- Configure Workbox precache for JS and CSS assets
- Add offline fallback route in service worker
- Create `OfflineFallback.jsx` component
- Add install prompt banner component
- Add `useInstallPrompt` hook for beforeinstallprompt event
- Dismiss and remember install banner in localStorage
- Add PWA meta tags to `index.html`
- Tests: offline fallback renders without network
- Tests: install prompt hook fires on event

---

## Transaction Confirmation Toast

**What:** After a move is broadcast, a small "Pending…" indicator replaces the current log message. When the 6-second `syncChainState` resolves and confirms the TX landed, it flips to "Confirmed ✓". If sync finds the board unchanged (TX dropped), it warns the player.

**Why it matters:** The current flow broadcasts a TX and then silently polls. Players don't know if their move actually landed. This closes that feedback loop without changing the sync timing.

**What it involves:**
- A `txStatus` state in `App.jsx`: `null | "pending" | "confirmed" | "dropped"`
- Compare board before and after `syncChainState` to detect a dropped TX
- Small status badge in the wallet bar — replaces the static network badge while pending

**Commits plan (~14 commits):**
- Add `txStatus` state to App.jsx (`null | "pending" | "confirmed" | "dropped"`)
- Set `txStatus` to `"pending"` immediately after move broadcast
- Snapshot board state before `syncChainState` call
- Compare board before/after to detect dropped TX
- Set `txStatus` to `"confirmed"` when board advances
- Set `txStatus` to `"dropped"` when board is unchanged after timeout
- Create `TxStatusBadge` component
- Render pending spinner in TxStatusBadge
- Render confirmed checkmark in TxStatusBadge
- Render dropped warning in TxStatusBadge
- Auto-clear `txStatus` after 4 seconds post-confirmation
- Style TxStatusBadge with entrance animation
- Tests: txStatus transitions pending → confirmed
- Tests: txStatus transitions pending → dropped on board match

---

## Dark / Light Theme Toggle

**What:** A sun/moon toggle in the header that switches between the current neomorphic dark palette and a light variant. Preference saved to localStorage.

**Why it matters:** A meaningful chunk of users prefer light mode; it's also better for readability in bright environments. The CSS custom-property system already used in `index.css` makes this straightforward.

**What it involves:**
- A second set of CSS variables under `[data-theme="light"]` in `index.css`
- Toggle button in the header right section, alongside the network badge
- `useEffect` that writes/reads `localStorage.getItem("clarityxo.theme")` and sets `document.documentElement.dataset.theme`

**Commits plan (~16 commits):**
- Add `[data-theme="light"]` variable block to `index.css`
- Set light background, surface, and text colour values
- Set light neomorphic shadow values for raised/inset surfaces
- Set light accent colour for X and O markers
- Create `useTheme` hook for theme state management
- Read initial theme from `localStorage` in useTheme
- Write theme to `localStorage` on change in useTheme
- Set `document.documentElement.dataset.theme` on toggle
- Add theme toggle button to LandingHeader
- Add theme toggle button to game header area
- Add sun icon for light mode state
- Add moon icon for dark mode state
- Animate icon swap on toggle (CSS transition)
- Apply theme to scrollbar styles in index.css
- Tests: useTheme reads from localStorage on init
- Tests: useTheme writes to localStorage on toggle

---

## AI Difficulty Levels (Easy / Medium / Hard)

**What:** Let players choose how smart the AI is before starting a game. Easy plays random moves; Medium uses the existing priority algorithm; Hard uses a minimax algorithm to play perfectly.

**Why it matters:** New players find the current AI too hard — they never win. A difficulty selector dramatically lowers the barrier to entry and extends the lifetime of AI-vs-player mode.

**What it involves:**
- Easy: random empty-cell selection
- Medium: existing priority (win → block → center → corner → edge)
- Hard: minimax with alpha-beta pruning, always optimal
- Difficulty passed as a parameter to `start-game` and stored per-game in the contract
- Frontend: difficulty picker on the "New Game" screen

**Commits plan (~25 commits):**
- Add `difficulty` parameter to `start-game` contract function
- Add `game-difficulty` field to game state map in contract
- Implement easy AI: select uniformly random empty cell
- Implement hard AI: minimax helper function in contract
- Implement minimax base case: terminal state detection
- Implement minimax recursive scoring for win/loss/draw
- Implement alpha-beta pruning to cut search tree
- Wire difficulty to AI move selection in `make-move`
- Add `get-game-difficulty` read-only function
- Add difficulty constants to `constants.js` in frontend
- Create `DifficultyPicker` component
- Style DifficultyPicker with three neomorphic buttons
- Add active/selected style to chosen difficulty
- Render DifficultyPicker on start screen before New Game
- Pass selected difficulty to `start-game` transaction
- Show current difficulty in game header badge
- Disable difficulty change mid-game
- Add "You chose Hard — good luck" flavour text
- Tests: easy AI never picks occupied cell
- Tests: hard AI blocks player win on next move
- Tests: hard AI takes win when available
- Tests: hard AI takes center on empty board
- Tests: difficulty stored and returned correctly by contract

---

## Achievement / Badge System

**What:** Unlock on-chain or off-chain badges for hitting milestones: first win, win streak of 5, beat the hard AI, first PvP win, first trophy claimed, etc.
Displayed as a badge row on the player profile and in the game header.

**Why it matters:** Achievements are a proven engagement loop. They give players a reason to try new game modes, attempt streaks, and keep coming back.

**What it involves:**
- Backend: achievement definitions list with unlock conditions
- Backend: check conditions on each game result write; mark unlocked in MongoDB
- New `GET /api/player/:address/achievements` endpoint
- Frontend: `AchievementToast` that pops up when a new achievement unlocks
- Frontend: achievement gallery on player profile modal

**Commits plan (~28 commits):**
- Create achievement definitions file in backend
- Define "First Win" achievement (trigger: first win recorded)
- Define "Win Streak x3" achievement (trigger: streak reaches 3)
- Define "Win Streak x5" achievement (trigger: streak reaches 5)
- Define "Win Streak x10" achievement (trigger: streak reaches 10)
- Define "Beat the Hard AI" achievement (trigger: win vs difficulty=hard)
- Define "First PvP Win" achievement (trigger: first pvp-mode win)
- Define "Challenger" achievement (trigger: first challenge sent)
- Define "Champion" achievement (trigger: first trophy claimed)
- Define "Draw Master" achievement (trigger: 10 draws total)
- Define "Century" achievement (trigger: 100 total games played)
- Add achievement unlock check function in backend
- Add achievements collection to MongoDB schema
- Call achievement check after every game result write
- Add `GET /api/player/:address/achievements` route
- Return unlocked list with unlock timestamp
- Add `fetchAchievements` utility in frontend
- Add `useAchievements` hook in frontend
- Create `AchievementBadge` component (icon + label)
- Create `AchievementToast` component (slide-in banner)
- Show AchievementToast when new achievement detected
- Add achievement gallery to player profile section
- Add locked/unlocked visual state to badge
- Add tooltip with unlock condition to locked badge
- Style achievement badges with neomorphic card
- Tests: "First Win" unlocks after first win stored
- Tests: streak achievement unlocks at correct count
- Tests: achievements endpoint returns correct shape
- Tests: AchievementToast renders with badge name

---

## Player Profile Modal

**What:** Click any wallet address or BNS name in the app (leaderboard, PvP lobby, game) to open a profile modal showing their all-time stats, current month rank, achievements, and recent games.

**Why it matters:** Social identity is a core part of on-chain gaming. Knowing who you are up against (or who beat you) makes competition feel real.

**What it involves:**
- `PlayerProfile` modal component
- Fetches from `/api/player/:address/stats` and `/api/player/:address/achievements`
- Shows: avatar (Stacks-derived), BNS name, all-time record, current rank, badges, recent game outcomes

**Commits plan (~22 commits):**
- Create `PlayerProfile.jsx` modal component
- Add modal overlay and close-on-backdrop-click
- Add address header with abbreviated display
- Resolve and show BNS name in profile header
- Add Stacks avatar (identicon based on address)
- Add all-time wins / draws / losses stats row
- Add current month rank display
- Add current streak indicator
- Add best streak record
- Add achievement badge row (top 5 unlocked)
- Add "View All Achievements" expansion toggle
- Add recent games section (last 5 outcomes)
- Add "Challenge to PvP" button for other player profiles
- Make wallet addresses in Leaderboard clickable
- Make wallet addresses in PvPLobby clickable
- Make opponent address in game header clickable
- Add slide-in animation to profile modal
- Style profile modal with neomorphic card panels
- Add loading skeleton while fetching profile data
- Add empty state for brand-new players
- Tests: profile modal renders with mocked stats
- Tests: BNS name shows when resolved, address shows when not

---

## Tutorial Mode (Onboarding Flow)

**What:** A step-by-step interactive overlay that teaches new players how to play tic-tac-toe on-chain: connect wallet → start game → make a move → understand scoring → explore PvP.

**Why it matters:** Crypto-native games have a steep on-boarding cliff. A guided first-run cuts the abandonment rate for players who arrive without knowing what Stacks is.

**What it involves:**
- `useTutorial` hook managing step state; persists completion to localStorage
- Tooltip-style step highlights that point at real UI elements
- "Skip Tutorial" option throughout
- Triggered automatically on first visit (no wallet connected); also accessible from Help menu

**Commits plan (~22 commits):**
- Create `useTutorial` hook
- Add tutorial step definitions array (7 steps)
- Step 1: Welcome screen ("This is ClarityXO")
- Step 2: Highlight wallet connect button
- Step 3: Explain the game board cells
- Step 4: Highlight "New Game" button
- Step 5: First move highlight with arrow
- Step 6: Explain scoring (3 pts win / 1 pt draw)
- Step 7: Invite to try PvP lobby
- Add `TutorialTooltip` component with arrow pointer
- Add dimmed backdrop with highlighted element cutout
- Add Previous / Next navigation buttons
- Add step counter ("Step 3 of 7")
- Add "Skip Tutorial" button
- Mark tutorial complete in localStorage on last step
- Re-trigger tutorial from "?" help button in header
- Animate tooltip entrance per step
- Style tutorial tooltip with neomorphic card
- Tests: tutorial step advances on Next click
- Tests: skip sets completion flag in localStorage
- Tests: tutorial does not re-show on second visit
- Tests: tutorial rerenders on "?" button click

---

## NFT Gallery

**What:** A dedicated page or modal where players can browse their claimed ClarityXO trophies — showing month, rank, and a stylised card for each NFT.

**Why it matters:** NFT holders have no in-app way to see or show off their trophies. A gallery increases the perceived value of claiming.

**What it involves:**
- Read from the `clarityxotrophyv2` contract: `get-player-rank(month, player)` and `has-claimed(month, player)`
- Backend: NFT index endpoint `GET /api/nfts/:address` returning claimed trophies
- Frontend: `NFTGallery` page/modal component

**Commits plan (~18 commits):**
- Add `GET /api/nfts/:address` route to backend
- Query MongoDB for all months where player has claimed
- Add trophy metadata to response (month, rank, token-id)
- Add `fetchNFTs` utility in frontend
- Add `useNFTs` hook in frontend
- Create `NFTGallery.jsx` component
- Add route `/gallery` to App.jsx router
- Add "My Trophies" link in navigation header
- Render trophy card grid layout
- Create `TrophyCard` component (month + rank + golden border)
- Add rank-colour distinction (gold/silver/bronze for 1/2/3)
- Add empty state ("No trophies yet — reach top 5 to earn one")
- Add link to claim unclaimed eligible trophies
- Add share button on each trophy card
- Style NFTGallery page with neomorphic panels
- Add trophy count badge on nav link
- Tests: `GET /api/nfts/:address` returns correct list
- Tests: TrophyCard renders with correct rank colour

---

## Rematch System (PvP)

**What:** After a PvP game ends, either player can tap "Rematch" to instantly send a re-challenge to their opponent with roles reversed (X/O swapped).

**Why it matters:** The biggest friction in PvP right now is re-initiating a challenge after each game. A one-tap rematch keeps competitive sessions alive.

**What it involves:**
- `create-rematch(previous-game-id)` wrapper that auto-fills opponent from past game
- Backend: push a rematch notification to opponent (polling or SSE)
- Frontend: Rematch button in PvP game result view

**Commits plan (~18 commits):**
- Add `create-rematch` function wrapper in `pvp.js` utility
- Extract opponent address from ended PvP game state
- Auto-fill opponent when calling `create-challenge` for rematch
- Add "Rematch" button to PvP end-game view in Game.jsx
- Show "Waiting for rematch acceptance…" state
- Add rematch request to PvP lobby panel
- Add `POST /api/rematch` endpoint to backend
- Store rematch intent linked to previous game ID
- Push rematch flag on polling response for opponent
- Add `useRematch` hook in frontend
- Poll for pending rematch on game end screen
- Highlight incoming rematch offer in PvP lobby
- Add rematch decline path
- Add timeout for rematch offer (30 seconds)
- Style rematch button with accent color
- Tests: create-rematch correctly pulls opponent from game state
- Tests: rematch offer expires after timeout
- Tests: accept rematch transitions to new lobby game

---

## Spectator Mode (PvP Live View)

**What:** Any player can watch a live PvP game in progress by entering the game ID. The board auto-refreshes every 10 seconds to show the latest on-chain state.

**Why it matters:** Spectating adds social depth — players can share live game links and build an audience.

**What it involves:**
- `GET /api/pvp/live` backend endpoint returning active game IDs
- Frontend: Spectator view rendering board in read-only mode with auto-refresh
- Share link: `clarityxo.xyz/spectate/:gameId`

**Commits plan (~18 commits):**
- Add `GET /api/pvp/live` to backend (list active PvP game IDs)
- Add `GET /api/pvp/:gameId/state` to backend
- Add `fetchLiveGames` utility in frontend
- Create `SpectatorLobby.jsx` component
- Render list of live games with player addresses
- Add route `/spectate/:gameId` to App.jsx
- Create `SpectatorView.jsx` component
- Render read-only board from on-chain state
- Auto-refresh board every 10 seconds in spectator mode
- Show current turn indicator in spectator view
- Add game status banner (ACTIVE / ENDED)
- Show player addresses and scores in spectator header
- Add spectator count badge (backend tracks active spectators)
- Add share-link copy button for spectator URL
- Add "Spectate a Game" link in PvP lobby
- Style spectator view with read-only board overlay
- Tests: spectator board refreshes on interval
- Tests: read-only board ignores click events

---

## Referral System

**What:** Players get a unique referral link. When a referred player connects their wallet and plays their first game, the referrer earns 5 bonus points on the current monthly leaderboard.

**Why it matters:** Word-of-mouth growth incentivised on-chain. Bonus points are small enough not to game the leaderboard but meaningful enough to motivate sharing.

**What it involves:**
- Backend: Generate and store referral codes per wallet address
- Backend: Track first-game for referred players; credit referrer
- Frontend: "Invite Friends" section in navigation or profile

**Commits plan (~14 commits):**
- Add `POST /api/referral/generate` to backend
- Generate short unique code per wallet address
- Store referral code → referrer mapping in MongoDB
- Add `GET /api/referral/:code` to resolve referrer
- Track `referredBy` on new player document
- Credit referrer 5 pts on referred player's first game
- Add `GET /api/referral/stats/:address` for referral count
- Add `fetchReferralCode` utility in frontend
- Create `ReferralSection.jsx` in profile or settings
- Render unique referral link with copy button
- Show referral count ("You've invited 3 players")
- Add referral param parsing on page load (`?ref=CODE`)
- Tests: referral code generates consistently per address
- Tests: first game credit fires exactly once per referred player

---

## Comprehensive Clarity Contract Tests

**What:** Expand the Clarity test suite to cover every public function, all error paths, edge cases, and the new difficulty + rematch features.

**Why it matters:** The contracts are immutable once deployed. Untested edge cases become permanent bugs. Full coverage is non-negotiable before mainnet expansion.

**Commits plan (~30 commits):**
- Test `start-game` success path
- Test `start-game` rejects when active game exists
- Test `make-move` cell indexing (all 9 cells)
- Test `make-move` rejects occupied cell
- Test `make-move` rejects when game not active
- Test `make-move` detects row win (all 3 rows)
- Test `make-move` detects column win (all 3 columns)
- Test `make-move` detects diagonal win (both diagonals)
- Test `make-move` detects draw (board full, no winner)
- Test `resign-game` sets status to O_WON
- Test `resign-game` rejects when no active game
- Test AI blocks player winning move (medium difficulty)
- Test AI takes win when available (medium difficulty)
- Test AI takes center on open board (medium difficulty)
- Test AI picks corner before edge (medium difficulty)
- Test hard AI always blocks (never allows player win from any position)
- Test `create-challenge` stores challenge correctly
- Test `create-challenge` rejects self-challenge
- Test `accept-challenge` starts PvP game
- Test `decline-challenge` removes challenge
- Test `cancel-challenge` removes own challenge
- Test `make-pvp-move` enforces turn order
- Test `make-pvp-move` rejects wrong player
- Test PvP win increments winner stats by 5 pts
- Test monthly stats accumulate across multiple games
- Test `get-monthly-stats` returns correct month bucket
- Test NFT trophy `set-month-winners` owner-only
- Test NFT trophy `claim-trophy` success
- Test NFT trophy `claim-trophy` rejects double-claim
- Test NFT trophy `claim-trophy` rejects ineligible player

---

## Comprehensive Frontend Vitest Tests

**What:** Expand JavaScript test coverage to every utility function, hook, and component in the frontend — including all new features.

**Commits plan (~32 commits):**
- Tests: `gameLogic.js` — all win conditions
- Tests: `gameLogic.js` — draw detection
- Tests: `gameLogic.js` — invalid move rejection
- Tests: `leaderboardLogic.js` — sort by points descending
- Tests: `leaderboardLogic.js` — tie-breaking by wins
- Tests: `constants.js` — all exports defined and correct type
- Tests: `bns.js` — resolves BNS name from address
- Tests: `bns.js` — falls back to address when no BNS
- Tests: `stacks.js` — network selection matches environment
- Tests: `pvp.js` — create challenge transaction structure
- Tests: `pvp.js` — accept challenge transaction structure
- Tests: `pvp.js` — make PvP move transaction structure
- Tests: `share.js` — generateShareText win message contains rank
- Tests: `share.js` — generateShareText draw message
- Tests: `share.js` — generateShareText PvP message
- Tests: `useSoundEffects` — mute state reads from localStorage
- Tests: `useSoundEffects` — toggleMute updates localStorage
- Tests: `useTheme` — reads theme from localStorage on init
- Tests: `useTheme` — writes theme to localStorage on change
- Tests: `useTutorial` — step advances on next()
- Tests: `useTutorial` — skip marks complete in localStorage
- Tests: `usePlayerStats` — fetches and returns stats
- Tests: `useAchievements` — returns unlocked list
- Tests: `useNFTs` — returns claimed trophy list
- Tests: `useRematch` — polling resolves on rematch available
- Tests: `TxStatusBadge` — renders pending spinner
- Tests: `TxStatusBadge` — renders confirmed checkmark
- Tests: `DifficultyPicker` — selects and emits difficulty
- Tests: `AchievementToast` — renders badge name and icon
- Tests: `TrophyCard` — renders gold border for rank 1
- Tests: `PlayerProfile` — renders BNS name when available
- Tests: gameLogic stress test — 10,000 random game sequences produce valid outcomes

---

## Backend API Tests

**What:** Unit and integration tests for all backend API routes using a test MongoDB instance.

**Commits plan (~20 commits):**
- Set up test MongoDB with in-memory server
- Add test runner setup to backend package.json
- Tests: `GET /api/leaderboard` returns sorted array
- Tests: `GET /api/leaderboard?month=YYYY-MM` returns correct month
- Tests: `GET /api/player/:address/stats` returns correct shape
- Tests: streak computed correctly in stats endpoint
- Tests: `GET /api/player/:address/achievements` returns unlocked
- Tests: achievement unlocks on first win write
- Tests: achievement does not double-unlock
- Tests: `GET /api/nfts/:address` returns claimed trophies
- Tests: `GET /api/pvp/live` returns only ACTIVE games
- Tests: `POST /api/referral/generate` is idempotent per address
- Tests: referral credit fires once on first game
- Tests: `GET /api/referral/stats/:address` returns count
- Tests: leaderboard snapshot saves on month change
- Tests: available months endpoint lists only non-empty months
- Tests: `GET /api/player/:address/stats` handles new player (zero stats)
- Tests: backend error handler returns correct status codes
- Tests: MongoDB connection failure returns 503
- Tests: request validation rejects malformed addresses

---

## Summary Table

| Feature | Status | Est. Commits |
|---|---|---|
| PvP Mode | ✅ Shipped | — |
| Season Archive | Planned | 18 |
| Win Streak & All-Time Stats | Planned | 22 |
| Sound Effects | Planned | 16 |
| Share Your Game | Planned | 20 |
| PWA | Planned | 15 |
| Transaction Confirmation Toast | Planned | 14 |
| Dark/Light Theme Toggle | Planned | 16 |
| AI Difficulty Levels | Planned | 25 |
| Achievement System | Planned | 28 |
| Player Profile Modal | Planned | 22 |
| Tutorial Mode | Planned | 22 |
| NFT Gallery | Planned | 18 |
| Rematch System | Planned | 18 |
| Spectator Mode | Planned | 18 |
| Referral System | Planned | 14 |
| Clarity Contract Tests | Planned | 30 |
| Frontend Vitest Tests | Planned | 32 |
| Backend API Tests | Planned | 20 |
| **Total** | | **~378** |
