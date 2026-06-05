const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function createGame(gameName) {
  const result = await query(
    'INSERT INTO games (game_name, status) VALUES ($1, $2) RETURNING id',
    [gameName, 'waiting']
  );
  return result.rows[0].id;
}

async function startGame(gameName) {
  await query(
    'UPDATE games SET status = $1, started_at = NOW() WHERE game_name = $2',
    ['active', gameName]
  );
}

async function endGame(gameName) {
  await query(
    'UPDATE games SET status = $1, ended_at = NOW() WHERE game_name = $2',
    ['finished', gameName]
  );
}

async function logEvent(gameName, eventType, payload = {}) {
  const gameResult = await query(
    'SELECT id FROM games WHERE game_name = $1 ORDER BY created_at DESC LIMIT 1',
    [gameName]
  );
  if (gameResult.rows.length === 0) return;
  const gameId = gameResult.rows[0].id;
  await query(
    'INSERT INTO game_events (game_id, event_type, payload) VALUES ($1, $2, $3)',
    [gameId, eventType, JSON.stringify(payload)]
  );
}

module.exports = { createGame, startGame, endGame, logEvent };
