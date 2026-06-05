const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameCollection = require('./games.js').GameCollection;
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const games = new GameCollection();

app.use(express.json());
app.use(express.static(__dirname + '/../game'));

// Endpoint para consultar histórico de lutas
app.get('/api/history', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      'SELECT * FROM games ORDER BY created_at DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 55555;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const Responses = {
  SUCCESS: 0,
  GAME_EXISTS: 1,
  GAME_NOT_EXISTS: 2,
  GAME_FULL: 3
};

const Requests = {
  CREATE_GAME: 'create-game',
  JOIN_GAME: 'join-game'
};

io.on('connection', (socket) => {
  socket.on(Requests.CREATE_GAME, async (gameName) => {
    if (games.createGame(gameName)) {
      games.getGame(gameName).addPlayer(socket);
      socket.emit('response', Responses.SUCCESS);
      try {
        await db.createGame(gameName);
        await db.logEvent(gameName, 'game_created');
      } catch (err) {
        console.error('DB error on create-game:', err.message);
      }
    } else {
      socket.emit('response', Responses.GAME_EXISTS);
    }
  });

  socket.on(Requests.JOIN_GAME, async (gameName) => {
    const game = games.getGame(gameName);
    if (!game) {
      socket.emit('response', Responses.GAME_NOT_EXISTS);
    } else {
      if (game.addPlayer(socket)) {
        socket.emit('response', Responses.SUCCESS);
        try {
          await db.startGame(gameName);
          await db.logEvent(gameName, 'game_started');
        } catch (err) {
          console.error('DB error on join-game:', err.message);
        }
      } else {
        socket.emit('response', Responses.GAME_FULL);
      }
    }
  });
});

module.exports = { app, server };
