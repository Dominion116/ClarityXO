import 'dotenv/config';
import { MongoClient } from 'mongodb';

function normalizePlayer(player) {
  if (!player) return null;
  if (typeof player === 'string') return player;
  if (typeof player.value === 'string') return player.value;
  if (player.value && typeof player.value === 'object') return normalizePlayer(player.value);
  if (typeof player.address === 'string') return player.address;
  return null;
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db(process.env.MONGODB_DB || 'clarityxo');
  const games = db.collection(process.env.MONGODB_GAMES_COLLECTION || 'game_results');
  const leaderboard = db.collection(process.env.MONGODB_COLLECTION || 'leaderboard_months');

  const docs = await games.find({}).toArray();
  let normalizedCount = 0;

  for (const doc of docs) {
    const player = normalizePlayer(doc.player);
    if (player && player !== doc.player) {
      await games.updateOne({ _id: doc._id }, { $set: { player } });
      normalizedCount += 1;
    }
  }

  const normalizedGames = await games.find({}).toArray();
  const monthMap = new Map();

  for (const game of normalizedGames) {
    if (!game.player || game.status === 0) continue;

    const month = String(game.month ?? 0);
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        players: {},
        totals: { games: 0, totalPts: 0 },
      });
    }

    const monthEntry = monthMap.get(month);
    if (!monthEntry.players[game.player]) {
      monthEntry.players[game.player] = { pts: 0, wins: 0, draws: 0, losses: 0 };
    }

    const playerStats = monthEntry.players[game.player];
    playerStats.pts += Number(game.pts || 0);
    playerStats.wins += game.outcome === 'win' ? 1 : 0;
    playerStats.draws += game.outcome === 'draw' ? 1 : 0;
    playerStats.losses += game.outcome === 'loss' ? 1 : 0;
    monthEntry.totals.games += 1;
    monthEntry.totals.totalPts += Number(game.pts || 0);
  }

  await leaderboard.deleteMany({});
  if (monthMap.size > 0) {
    await leaderboard.insertMany(
      Array.from(monthMap.values()).map((doc) => ({
        ...doc,
        source: 'repair-script',
        updatedAt: new Date(),
      }))
    );
  }

  console.log(JSON.stringify({
    normalizedCount,
    games: normalizedGames.length,
    months: monthMap.size,
    samplePlayers: Array.from(monthMap.values()).flatMap((m) => Object.keys(m.players)).slice(0, 5),
  }, null, 2));

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
