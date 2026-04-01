const express  = require('express');
const router   = express.Router();
const { randomBoard, processAttack, runComputerTurn } = require('../gameEngine');
const { makeEmptyGrid, makeShipsMap, makeEmptyAttacks } = require('../gameEngine');
const repo     = require('../gameRepository');

router.post('/game', async (req, res) => {
  try {
    const { computerGrid, computerShips } = randomBoard();

    let playerGrid, playerShips;

    if (req.body.playerShips && Array.isArray(req.body.playerShips)) {
      const result = buildPlayerBoard(req.body.playerShips);

      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      playerGrid  = result.grid;
      playerShips = result.ships;
    } else {
      ({ grid: playerGrid, ships: playerShips } = randomBoard());
    }

    const game = await repo.createGame({ computerGrid, computerShips, playerGrid, playerShips });

    return res.status(201).json({
      gameId:      game.id,
      playerGrid,
      playerShips,
      status:      game.status,
    });
  } catch (err) {
    console.error('POST /api/game error:', err);
    return res.status(500).json({ error: 'Failed to create game.' });
  }
});

router.get('/game/:id', async (req, res) => {
  try {
    const game = await repo.getGameById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found.' });

    return res.json(safeGameView(game));
  } catch (err) {
    console.error('GET /api/game/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch game.' });
  }
});

router.post('/move', async (req, res) => {
  const { gameId, row, col } = req.body;
  if (!gameId || typeof gameId !== 'string') {
    return res.status(400).json({ error: 'gameId is required.' });
  }

  const r = Number(row);
  const c = Number(col);

  if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r > 9 || c < 0 || c > 9) {
    return res.status(400).json({ error: 'row and col must be integers between 0 and 9.' });
  }

  try {
    const game = await repo.getGameById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found.' });

    if (game.status !== 'active') {
      return res.status(409).json({ error: `Game is already over: ${game.status}.` });
    }

    if (game.turn !== 'player') {
      return res.status(409).json({ error: 'Not your turn.' });
    }
    const computerBoard = {
      grid:    game.computer_grid,
      ships:   game.computer_ships,
      attacks: game.player_attacks, 
    };

    const playerBoard = {
      grid:    game.player_grid,
      ships:   game.player_ships,
      attacks: game.computer_attacks, 
    };

    const huntMemory = game.hunt_memory; 
    const playerMoveResult = processAttack(computerBoard, r, c);

    if (!playerMoveResult.valid) {
      return res.status(400).json({ error: playerMoveResult.result });
    }

    let newTurn   = 'player';
    let newStatus = 'active';

    if (playerMoveResult.allSunk) {
      newStatus = 'player_won';
      await repo.updateGameState(game.id, {
        computerShips:    computerBoard.ships,
        playerAttacks:    computerBoard.attacks,
        playerShips:      playerBoard.ships,
        computerAttacks:  playerBoard.attacks,
        turn:             newTurn,
        status:           newStatus,
        huntMemory,
        previousUpdatedAt: game.updated_at,
      });

      return res.json({
        playerMove:    { row: r, col: c, ...playerMoveResult },
        computerMoves: [],
        turn:          newTurn,
        status:        newStatus,
        gameId,
      });
    }

    let computerMoveResults = [];

    if (playerMoveResult.result === 'miss') {
      computerMoveResults = runComputerTurn(playerBoard, huntMemory);

      const lastComputerMove = computerMoveResults[computerMoveResults.length - 1];
      if (lastComputerMove?.allSunk) {
        newStatus = 'computer_won';
      } else if (lastComputerMove?.result === 'miss') {
        newTurn = 'player';
      } else {
        newTurn = 'player';
      }
    }
    const updated = await repo.updateGameState(game.id, {
      computerShips:    computerBoard.ships,
      playerAttacks:    computerBoard.attacks,
      playerShips:      playerBoard.ships,
      computerAttacks:  playerBoard.attacks,
      turn:             newTurn,
      status:           newStatus,
      huntMemory,
      previousUpdatedAt: game.updated_at,
    });

    if (!updated) {
      return res.status(409).json({ error: 'Concurrent move detected. Please retry.' });
    }

    return res.json({
      playerMove:    { row: r, col: c, ...playerMoveResult },
      computerMoves: computerMoveResults,
      turn:          newTurn,
      status:        newStatus,
      gameId,
    });
  } catch (err) {
    console.error('POST /api/move error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

function buildPlayerBoard(placements) {
  const { placeShip } = require('../gameEngine');
  const grid  = makeEmptyGrid();
  const ships = makeShipsMap();

  for (const p of placements) {
    const { shipIndex, startRow, startCol, endRow, endCol } = p;
    const shipId = `ship_${shipIndex}`;

    if (!ships[shipId]) {
      return { ok: false, error: `Invalid shipIndex: ${shipIndex}` };
    }

    const ok = placeShip(grid, shipId, startRow, startCol, endRow, endCol);
    if (!ok) {
      return { ok: false, error: `Invalid placement for ship_${shipIndex}.` };
    }
  }

  return { ok: true, grid, ships };
}

function safeGameView(game) {
  return {
    gameId:          game.id,
    playerGrid:      game.player_grid,
    playerShips:     game.player_ships,
    playerAttacks:   game.player_attacks,
    computerAttacks: game.computer_attacks,
    computerShips:   sanitizeShips(game.computer_ships),
    turn:            game.turn,
    status:          game.status,
  };
}

function sanitizeShips(ships) {
  const result = {};
  for (const [id, ship] of Object.entries(ships)) {
    result[id] = { length: ship.length, sunk: ship.sunk };
  }
  return result;
}

module.exports = router;
