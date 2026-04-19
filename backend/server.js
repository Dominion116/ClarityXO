import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { cvToHex, cvToJSON, deserializeCV, uintCV } from '@stacks/transactions';

const app = express();
const PORT = process.env.PORT || 8787;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'clarityxo';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'leaderboard_months';
const MONGODB_GAMES_COLLECTION = process.env.MONGODB_GAMES_COLLECTION || 'game_results';
const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y';
const GAME_CONTRACT_NAME = process.env.GAME_CONTRACT_NAME || 'clarity-xo-game';
const STACKS_API_BASE = process.env.STACKS_API_BASE || 'https://api.hiro.so';

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => normalizeOrigin(value)).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls and local tools without an Origin header.
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ClarityXO Leaderboard API',
    version: '1.0.0',
    description: 'Leaderboard and scoring API for ClarityXO, deployed on Render with MongoDB Atlas.',
  },
  servers: [
    { url: process.env.PUBLIC_API_URL || 'https://clarityxo.onrender.com' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Backend is healthy',
          },
        },
      },
    },
    '/api/leaderboard': {
      get: {
        summary: 'Get monthly leaderboard',
        parameters: [
          {
            name: 'month',
            in: 'query',
            required: false,
            schema: { type: 'string', example: '2026-04' },
          },
        ],
        responses: {
          200: {
            description: 'Leaderboard data',
          },
        },
      },
      delete: {
        summary: 'Clear monthly leaderboard',
        parameters: [
          {
            name: 'month',
            in: 'query',
            required: false,
            schema: { type: 'string', example: '2026-04' },
          },
        ],
        responses: {
          200: {
            description: 'Leaderboard cleared',
          },
        },
      },
    },
    '/api/leaderboard/result': {
      post: {
        summary: 'Record a game result',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['walletAddr', 'outcome'],
                properties: {
                  walletAddr: { type: 'string', example: 'SP2C2YB2M7WZ8Q4P8A9VQYQMW9C03R9X62H2W8A1K' },
                  outcome: { type: 'string', enum: ['win', 'draw', 'loss'] },
                  month: { type: 'string', example: '2026-04' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Result stored',
          },
        },
      },
    },
    '/api/sync': {
      post: {
        summary: 'Sync on-chain games into the database',
        responses: {
          200: {
            description: 'Chain data synchronized',
          },
        },
      },
    },
  },
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
}));
app.get('/api-docs/', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

let mongoClient;
let mongoClientPromise;

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function encodeUintArg(value) {
  return cvToHex(uintCV(value));
}

function parseClarityUintValue(text) {
  const decoded = typeof text === 'string' && text.startsWith('0x')
    ? cvToJSON(deserializeCV(text))
    : text;

  if (!decoded || typeof decoded !== 'object') {
    const match = String(text || '').match(/u(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  if (decoded.type === 'uint' && decoded.value != null) {
    return Number(decoded.value);
  }

  if (decoded.success && decoded.value) {
    return parseClarityUintValue(decoded.value);
  }

  if (Array.isArray(decoded.value)) {
    for (const item of decoded.value) {
      const nested = parseClarityUintValue(item);
      if (nested) return nested;
    }
  }

  if (decoded.value && typeof decoded.value === 'object') {
    for (const nestedValue of Object.values(decoded.value)) {
      const nested = parseClarityUintValue(nestedValue);
      if (nested) return nested;
    }
  }

  return 0;
}

function normalizePrincipalValue(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    if (typeof value.value === 'string') {
      return value.value;
    }

    if (value.value && typeof value.value === 'object') {
      return normalizePrincipalValue(value.value);
    }

    if (typeof value.address === 'string') {
      return value.address;
    }
  }

  return null;
}

function parseGameState(resultText) {
  const decoded = typeof resultText === 'string' && resultText.startsWith('0x')
    ? cvToJSON(deserializeCV(resultText))
    : resultText;
  const tuple = decoded?.success ? decoded.value : decoded;
  const fields = tuple?.value || tuple || {};

  return {
    board: Array.isArray(fields.board?.value)
      ? fields.board.value.map((cell) => Number(cell.value))
      : Array(9).fill(0),
    status: Number(fields.status?.value || 0),
    moves: Number(fields.moves?.value || 0),
    month: Number(fields.month?.value || 0),
    player: normalizePrincipalValue(fields.player),
  };
}

async function callReadOnly(functionName, args = []) {
  const url = `${STACKS_API_BASE}/v2/contracts/call-read/${GAME_CONTRACT_ADDRESS}/${GAME_CONTRACT_NAME}/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: GAME_CONTRACT_ADDRESS, arguments: args }),
  });

  if (!response.ok) {
    throw new Error(`Read-only call failed: ${response.status}`);
  }

  return response.json();
}

async function getCurrentChainMonthKey() {
  const response = await callReadOnly('current-month');
  return String(parseClarityUintValue(response?.result));
}

async function getDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!mongoClientPromise) {
    mongoClient = new MongoClient(MONGODB_URI);
    mongoClientPromise = mongoClient.connect();
  }

  await mongoClientPromise;
  return mongoClient.db(MONGODB_DB);
}

async function getMonthCollection() {
  const db = await getDatabase();
  return db.collection(MONGODB_COLLECTION);
}

async function getGamesCollection() {
  const db = await getDatabase();
  return db.collection(MONGODB_GAMES_COLLECTION);
}

async function getLatestStoredGameId() {
  const collection = await getGamesCollection();
  const doc = await collection.findOne({}, { sort: { gameId: -1 } });
  return Number(doc?.gameId || 0);
}

async function getMonthData(monthKey) {
  const collection = await getMonthCollection();
  const doc = await collection.findOne({ month: monthKey });
  return doc || { month: monthKey, players: {} };
}

async function getLatestMonthKey() {
  const collection = await getMonthCollection();
  const doc = await collection.findOne({}, { sort: { updatedAt: -1, month: -1 } });
  return doc?.month || null;
}

/**
 * Rebuild leaderboard aggregates from game_results for the given months.
 * Uses a merge strategy: for each player, takes the max of chain-calculated
 * values vs existing DB values so that results recorded via POST are never lost.
 */
async function rebuildLeaderboardForMonths(monthKeys) {
  if (!monthKeys || monthKeys.length === 0) return;

  const gamesCollection = await getGamesCollection();
  const leaderboardCollection = await getMonthCollection();

  for (const monthKey of monthKeys) {
    const games = await gamesCollection.find({
      month: Number(monthKey) || monthKey,
      status: { $in: [1, 2, 3] },
    }).toArray();

    // Build player stats from chain game_results
    const chainPlayerMap = {};
    for (const game of games) {
      const player = game.player;
      if (!player) continue;

      if (!chainPlayerMap[player]) {
        chainPlayerMap[player] = { pts: 0, wins: 0, draws: 0, losses: 0 };
      }
      const entry = chainPlayerMap[player];
      entry.pts += game.pts || 0;
      entry.wins += game.outcome === 'win' ? 1 : 0;
      entry.draws += game.outcome === 'draw' ? 1 : 0;
      entry.losses += game.outcome === 'loss' ? 1 : 0;
    }

    // Read existing leaderboard to merge (keep $inc values that haven't been
    // synced from chain yet)
    const existing = await leaderboardCollection.findOne({ month: String(monthKey) });
    const existingPlayers = existing?.players || {};

    // Merge: for each player, take the max of chain vs existing
    const mergedPlayers = { ...existingPlayers };
    for (const [player, chainStats] of Object.entries(chainPlayerMap)) {
      const dbStats = existingPlayers[player] || { pts: 0, wins: 0, draws: 0, losses: 0 };
      mergedPlayers[player] = {
        pts: Math.max(chainStats.pts, dbStats.pts || 0),
        wins: Math.max(chainStats.wins, dbStats.wins || 0),
        draws: Math.max(chainStats.draws, dbStats.draws || 0),
        losses: Math.max(chainStats.losses, dbStats.losses || 0),
      };
    }

    const totalGames = Object.values(mergedPlayers).reduce(
      (s, p) => s + (p.wins || 0) + (p.draws || 0) + (p.losses || 0), 0
    );
    const totalPts = Object.values(mergedPlayers).reduce((s, p) => s + (p.pts || 0), 0);

    await leaderboardCollection.updateOne(
      { month: String(monthKey) },
      {
        $set: {
          month: String(monthKey),
          players: mergedPlayers,
          totals: { games: totalGames, totalPts },
          source: 'chain-sync',
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }
}


// Track sync state
let syncInProgress = false;
let lastSyncTime = 0;
let backgroundSyncInterval = null;

/**
 * Incremental sync: only fetches new games from the chain (games after the
 * latest stored gameId). Rebuilds leaderboard aggregates via upsert so data
 * is never temporarily empty.
 */
async function syncLeaderboardFromChain() {
  const nextGameResponse = await callReadOnly('get-next-game-id');
  const nextGameId = parseClarityUintValue(nextGameResponse?.result);

  if (!nextGameId || nextGameId < 1) {
    return { syncedGames: 0, leaderboardMonths: 0 };
  }

  // Only fetch games we don't already have (incremental sync)
  const latestStoredId = await getLatestStoredGameId();
  const startId = latestStoredId + 1;

  if (startId >= nextGameId) {
    // Already up to date
    return { syncedGames: 0, leaderboardMonths: 0 };
  }

  const newGames = [];
  const affectedMonths = new Set();

  for (let gameId = startId; gameId < nextGameId; gameId += 1) {
    try {
      const gameResponse = await callReadOnly('get-full-game-state', [encodeUintArg(gameId)]);
      const state = parseGameState(gameResponse?.result);

      if (!state.player || state.status === 0) {
        continue;
      }

      const outcome = state.status === 1 ? 'win' : state.status === 2 ? 'loss' : 'draw';
      const pts = outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0;

      newGames.push({
        gameId,
        player: state.player,
        month: state.month,
        board: state.board,
        moves: state.moves,
        status: state.status,
        outcome,
        pts,
        updatedAt: new Date(),
      });

      affectedMonths.add(String(state.month));
    } catch (error) {
      console.error(`Failed to fetch game ${gameId}:`, error.message);
    }
  }

  // Store new games
  const gamesCollection = await getGamesCollection();
  if (newGames.length > 0) {
    await Promise.all(newGames.map((game) =>
      gamesCollection.updateOne(
        { gameId: game.gameId },
        { $set: game, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      )
    ));
  }

  // Rebuild only affected months (via upsert — never deletes existing data)
  if (affectedMonths.size > 0) {
    await rebuildLeaderboardForMonths(Array.from(affectedMonths));
  }

  return {
    syncedGames: newGames.length,
    leaderboardMonths: affectedMonths.size,
  };
}

// Debounced sync wrapper to prevent concurrent syncs
async function syncLeaderboardFromChainDebounced() {
  if (syncInProgress) {
    return { syncedGames: 0, leaderboardMonths: 0, debounced: true };
  }

  syncInProgress = true;
  try {
    const result = await syncLeaderboardFromChain();
    lastSyncTime = Date.now();
    return result;
  } finally {
    syncInProgress = false;
  }
}

/**
 * Start a background sync loop that runs every 60 seconds.
 * This keeps the DB up to date without blocking leaderboard reads.
 */
function startBackgroundSync() {
  if (backgroundSyncInterval) return;

  backgroundSyncInterval = setInterval(() => {
    syncLeaderboardFromChainDebounced().catch((error) => {
      console.error('Background sync failed:', error.message);
    });
  }, 60_000);
}

// ───────────── ROUTES ─────────────

app.get('/health', (_req, res) => {
  res.json({ ok: true, backend: 'mongo' });
});

/**
 * GET /api/leaderboard
 * Pure DB read — never triggers chain sync. Fast and reliable.
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const month = req.query.month || await getLatestMonthKey();

    if (!month) {
      // No data in DB at all yet
      return res.json({ month: 'latest', players: {}, source: 'mongodb' });
    }

    const monthData = await getMonthData(month);
    res.json({ month, players: monthData.players || {}, source: 'mongodb' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leaderboard/result', async (req, res) => {
  const { walletAddr, outcome, month } = req.body || {};
  const validOutcomes = new Set(['win', 'draw', 'loss']);

  if (!walletAddr || typeof walletAddr !== 'string') {
    return res.status(400).json({ error: 'walletAddr is required' });
  }
  if (!validOutcomes.has(outcome)) {
    return res.status(400).json({ error: 'outcome must be win|draw|loss' });
  }

  const ptsMap = { win: 3, draw: 1, loss: 0 };
  const outcomeFieldMap = { win: 'wins', draw: 'draws', loss: 'losses' };
  const monthKey = month || await getLatestMonthKey() || await getCurrentChainMonthKey();
  const incField = outcomeFieldMap[outcome];

  try {
    const collection = await getMonthCollection();
    await collection.updateOne(
      { month: monthKey },
      {
        $setOnInsert: { month: monthKey },
        $inc: {
          [`players.${walletAddr}.pts`]: ptsMap[outcome],
          [`players.${walletAddr}.${incField}`]: 1,
        },
      },
      { upsert: true }
    );

    const updatedMonth = await collection.findOne({ month: monthKey });
    const stats = updatedMonth?.players?.[walletAddr] || { pts: 0, wins: 0, draws: 0, losses: 0 };
    return res.json({ ok: true, earned: ptsMap[outcome], month: monthKey, stats });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leaderboard', async (req, res) => {
  const { month } = req.query;
  try {
    const monthKey = month || await getLatestMonthKey() || await getCurrentChainMonthKey();
    const collection = await getMonthCollection();
    await collection.deleteOne({ month: monthKey });
    res.json({ ok: true, month: monthKey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync', async (_req, res) => {
  try {
    const result = await syncLeaderboardFromChainDebounced();
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function start() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    const db = await getDatabase();
    await db.collection(MONGODB_COLLECTION).createIndex({ month: 1 }, { unique: true });
    await db.collection(MONGODB_GAMES_COLLECTION).createIndex({ gameId: 1 }, { unique: true });

    app.listen(PORT, () => {
      console.log(`Leaderboard backend listening on :${PORT}`);
    });

    // Initial sync on startup (non-blocking)
    syncLeaderboardFromChainDebounced().catch((error) => {
      console.error('Initial blockchain sync failed:', error.message);
    });

    // Background sync every 60s to keep DB fresh
    startBackgroundSync();
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

start();
