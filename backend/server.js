import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const PORT = process.env.PORT || 8787;
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard.json');

app.use(cors());
app.use(express.json());

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = { months: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getMonthData(store, monthKey) {
  if (!store.months[monthKey]) {
    store.months[monthKey] = { players: {} };
  }
  return store.months[monthKey];
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/leaderboard', (req, res) => {
  const store = readStore();
  const month = req.query.month || getMonthKey();
  const monthData = getMonthData(store, month);
  res.json({ month, players: monthData.players, source: 'backend' });
});

app.post('/api/leaderboard/result', (req, res) => {
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
  const store = readStore();
  const monthData = getMonthData(store, monthKey);

  if (!monthData.players[walletAddr]) {
    monthData.players[walletAddr] = { pts: 0, wins: 0, draws: 0, losses: 0 };
  }

  const p = monthData.players[walletAddr];
  p.pts += ptsMap[outcome];
  p[`${outcome}s`] += 1;

  writeStore(store);
  return res.json({ ok: true, earned: ptsMap[outcome], month: monthKey, stats: p });
});

app.delete('/api/leaderboard', (req, res) => {
  const { month } = req.query;
  const monthKey = month || getMonthKey();
  const store = readStore();
  store.months[monthKey] = { players: {} };
  writeStore(store);
  res.json({ ok: true, month: monthKey });
});

app.listen(PORT, () => {
  console.log(`Leaderboard backend listening on :${PORT}`);
});
