import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8787;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'clarityxo';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'leaderboard_months';

const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map((value) => value.trim()) }
  : undefined;

app.use(cors(corsOptions));
app.use(express.json());

let mongoClient;
let mongoClientPromise;

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
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

async function getMonthData(monthKey) {
  const collection = await getMonthCollection();
  const doc = await collection.findOne({ month: monthKey });
  return doc || { month: monthKey, players: {} };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, backend: 'mongo' });
});

app.get('/api/leaderboard', async (req, res) => {
  const month = req.query.month || getMonthKey();
  try {
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
  const monthKey = month || getMonthKey();
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
  const monthKey = month || getMonthKey();
  try {
    const collection = await getMonthCollection();
    await collection.deleteOne({ month: monthKey });
    res.json({ ok: true, month: monthKey });
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

    app.listen(PORT, () => {
      console.log(`Leaderboard backend listening on :${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

start();
