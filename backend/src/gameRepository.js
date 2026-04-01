const pool = require('./db');

async function createGame({ computerGrid, computerShips, playerGrid, playerShips }) {
  const emptyAttacks = JSON.stringify(
    Array.from({ length: 10 }, () => Array(10).fill(null))
  );

  const { rows } = await pool.query(
    `INSERT INTO games
       (computer_grid, computer_ships, player_attacks,
        player_grid,   player_ships,   computer_attacks,
        turn, status, hunt_memory)
     VALUES ($1, $2, $3, $4, $5, $3, 'player', 'active', '[]')
     RETURNING *`,
    [
      JSON.stringify(computerGrid),
      JSON.stringify(computerShips),
      emptyAttacks,
      JSON.stringify(playerGrid),
      JSON.stringify(playerShips),
    ]
  );

  return rows[0];
}
async function getGameById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM games WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

async function updateGameState(id, {
  computerShips,
  playerAttacks,
  playerShips,
  computerAttacks,
  turn,
  status,
  huntMemory,
  previousUpdatedAt,
}) {
  const { rows, rowCount } = await pool.query(
    `UPDATE games SET
       computer_ships    = $1,
       player_attacks    = $2,
       player_ships      = $3,
       computer_attacks  = $4,
       turn              = $5,
       status            = $6,
       hunt_memory       = $7
     WHERE id = $8
       AND updated_at = $9
     RETURNING *`,
    [
      JSON.stringify(computerShips),
      JSON.stringify(playerAttacks),
      JSON.stringify(playerShips),
      JSON.stringify(computerAttacks),
      turn,
      status,
      JSON.stringify(huntMemory),
      id,
      previousUpdatedAt,
    ]
  );

  if (rowCount === 0) {
    return null;
  }

  return rows[0];
}

module.exports = { createGame, getGameById, updateGameState };
