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

// Cache for stale check (15 second TTL to reduce blockchain API calls)
let stalenessCache = { result: null, timestamp: 0, ttlMs: 15000 };
let syncInProgress = false;
let lastSyncTime = 0;

async function isLeaderboardStale() {
  const now = Date.now();
  
  // If a sync completed recently (within 30s), assume it's fresh
  if (lastSyncTime && now - lastSyncTime < 30000) {
    return false;
  }

  // Return cached result if still valid
  if (stalenessCache.result !== null && now - stalenessCache.timestamp < stalenessCache.ttlMs) {
    return stalenessCache.result;
  }

  const [latestStoredGameId, nextGameResponse] = await Promise.all([
    getLatestStoredGameId(),
    callReadOnly('get-next-game-id'),
  ]);

  const chainNextGameId = parseClarityUintValue(nextGameResponse?.result);
  const chainLatestFinishedGameId = Math.max(0, chainNextGameId - 1);
  const stale = chainLatestFinishedGameId > latestStoredGameId;

  // Update cache
  stalenessCache = { result: stale, timestamp: now, ttlMs: 15000 };

  return stale;
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

async function syncLeaderboardFromChain() {
  const nextGameResponse = await callReadOnly('get-next-game-id');
  const nextGameId = parseClarityUintValue(nextGameResponse?.result);

  if (!nextGameId || nextGameId < 1) {
    return { syncedGames: 0, leaderboardMonths: 0 };
  }

  const finishedGames = [];

  for (let gameId = 1; gameId < nextGameId; gameId += 1) {
    try {
      const gameResponse = await callReadOnly('get-full-game-state', [encodeUintArg(gameId)]);
      const state = parseGameState(gameResponse?.result);

      if (!state.player || state.status === 0) {
        continue;
      }

      const outcome = state.status === 1 ? 'win' : state.status === 2 ? 'loss' : 'draw';
      const pts = outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0;

      finishedGames.push({
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
    } catch (error) {
      console.error(`Failed to fetch game ${gameId}:`, error.message);
    }
  }

  const gamesCollection = await getGamesCollection();
  if (finishedGames.length > 0) {
    await Promise.all(finishedGames.map((game) =>
      gamesCollection.updateOne(
        { gameId: game.gameId },
        { $set: game, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      )
    ));
  }

  const storedGames = await gamesCollection.find({ status: { $in: [1, 2, 3] } }).toArray();
  const monthMap = new Map();

  for (const game of storedGames) {
    const monthKey = String(game.month ?? 0);
    const playerKey = game.player;
    const aggregateKey = `${monthKey}:${playerKey}`;

    if (!monthMap.has(aggregateKey)) {
      monthMap.set(aggregateKey, {
        month: monthKey,
        player: playerKey,
        pts: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      });
    }

    const entry = monthMap.get(aggregateKey);
    entry.pts += game.pts || 0;
    entry.wins += game.outcome === 'win' ? 1 : 0;
    entry.draws += game.outcome === 'draw' ? 1 : 0;
    entry.losses += game.outcome === 'loss' ? 1 : 0;
  }

  const leaderboardCollection = await getMonthCollection();
  await leaderboardCollection.deleteMany({});

  const monthBuckets = new Map();
  for (const entry of monthMap.values()) {
    if (!monthBuckets.has(entry.month)) {
      monthBuckets.set(entry.month, { month: entry.month, players: {}, totals: { games: 0, totalPts: 0 } });
    }

    const monthEntry = monthBuckets.get(entry.month);
    monthEntry.players[entry.player] = {
      pts: entry.pts,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
    };
    monthEntry.totals.games += entry.wins + entry.draws + entry.losses;
    monthEntry.totals.totalPts += entry.pts;
  }

  const leaderboardDocs = Array.from(monthBuckets.values()).map((doc) => ({
    ...doc,
    source: 'chain-sync',
    updatedAt: new Date(),
  }));

  if (leaderboardDocs.length > 0) {
    await leaderboardCollection.insertMany(leaderboardDocs);
  }

  return {
    syncedGames: finishedGames.length,
    leaderboardMonths: leaderboardDocs.length,
  };
}

// Debounced sync wrapper to prevent concurrent syncs
async function syncLeaderboardFromChainDebounced() {
  // If a sync is already in progress, wait for it to finish
  if (syncInProgress) {
    // Wait up to 30 seconds for the in-progress sync to complete
    const startTime = Date.now();
    while (syncInProgress && Date.now() - startTime < 30000) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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

app.get('/health', (_req, res) => {
  res.json({ ok: true, backend: 'mongo' });
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const month = req.query.month || await getLatestMonthKey() || await getCurrentChainMonthKey();
    let monthData = await getMonthData(month);
    const stale = await isLeaderboardStale();

    if (stale || !monthData.players || Object.keys(monthData.players).length === 0) {
      try {
        await syncLeaderboardFromChainDebounced();
        monthData = await getMonthData(month);
      } catch (syncError) {
        console.error('Auto-sync on leaderboard read failed:', syncError.message);
      }
    }

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
  const monthKey = month || await getLatestMonthKey() || await getCurrentChainMonthKey();
  const incField = `${outcome}s`;

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
    const result = await syncLeaderboardFromChain();
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

    syncLeaderboardFromChain().catch((error) => {
      console.error('Initial blockchain sync failed:', error.message);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

start();
