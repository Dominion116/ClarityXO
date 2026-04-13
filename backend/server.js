import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Leaderboard backend listening on :${PORT}`);
});
