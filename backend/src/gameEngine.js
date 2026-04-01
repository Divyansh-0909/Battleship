const SHIP_LENGTHS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

function makeEmptyGrid() {
  return Array.from({ length: 10 }, () => Array(10).fill(null));
}

function makeEmptyAttacks() {
  return Array.from({ length: 10 }, () => Array(10).fill(null));
}

function makeShipsMap() {
  const ships = {};
  SHIP_LENGTHS.forEach((len, i) => {
    ships[`ship_${i}`] = { length: len, hits: 0, sunk: false };
  });
  return ships;
}

function checkSurrounding(grid, startRow, startCol, endRow, endCol) {
  for (let i = startRow - 1; i <= endRow + 1; i++) {
    for (let j = startCol - 1; j <= endCol + 1; j++) {
      if (i < 0 || i > 9 || j < 0 || j > 9) continue;
      if (grid[i][j] !== null) return false;
    }
  }
  return true;
}
function placeShip(grid, shipId, startRow, startCol, endRow, endCol) {
  if (
    startRow < 0 || startRow > 9 ||
    startCol < 0 || startCol > 9 ||
    endRow   < 0 || endRow   > 9 ||
    endCol   < 0 || endCol   > 9
  ) return false;

  if (startRow !== endRow && startCol !== endCol) return false;

  const orientation = startRow === endRow ? 'horizontal' : 'vertical';
  const start = orientation === 'horizontal' ? startCol : startRow;
  const end   = orientation === 'horizontal' ? endCol   : endRow;

  if (!checkSurrounding(grid, startRow, startCol, endRow, endCol)) return false;

  for (let i = start; i <= end; i++) {
    const r = orientation === 'horizontal' ? startRow : i;
    const c = orientation === 'horizontal' ? i        : startCol;
    grid[r][c] = { shipId, start, end, orientation };
  }

  return true;
}

function randomBoard() {
  const grid  = makeEmptyGrid();
  const ships = makeShipsMap();

  SHIP_LENGTHS.forEach((len, idx) => {
    const shipId = `ship_${idx}`;
    let placed = false;
    while (!placed) {
      const orientation = len === 1 ? 'horizontal' : (Math.random() < 0.5 ? 'horizontal' : 'vertical');
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);

      let endRow = row, endCol = col;

      if (orientation === 'horizontal') {
        endCol = col + len - 1;
        if (endCol > 9) continue;
      } else {
        endRow = row + len - 1;
        if (endRow > 9) continue;
      }

      placed = placeShip(grid, shipId, row, col, endRow, endCol);
    }
  });

  return { grid, ships };
}

// ─────────────────────────────────────────────────────────────────────────────
// Attack processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates and processes a single attack.
 *
 * @param {object} state  Full board state from DB for the TARGET board:
 *                        { grid, ships, attacks }
 * @param {number} row
 * @param {number} col
 *
 * @returns {object} {
 *   valid:       boolean,   // false if coords out of range or already attacked
 *   result:      'hit' | 'miss' | 'already_attacked' | 'invalid_coordinates',
 *   sunk:        boolean,   // true if the hit sank the ship
 *   shipId:      string | null,
 *   allSunk:     boolean,   // true if every ship is now sunk (game over)
 *   autoMarked:  [[r,c]]    // cells auto-marked as miss around a sunk ship
 * }
 */
function processAttack(state, row, col) {
  if (row < 0 || row > 9 || col < 0 || col > 9) {
    return { valid: false, result: 'invalid_coordinates', sunk: false, shipId: null, allSunk: false, autoMarked: [] };
  }
  if (state.attacks[row][col] !== null) {
    return { valid: false, result: 'already_attacked', sunk: false, shipId: null, allSunk: false, autoMarked: [] };
  }

  const cell = state.grid[row][col];
  const autoMarked = [];

  if (cell !== null) {
    state.attacks[row][col] = 1;

    const ship = state.ships[cell.shipId];
    ship.hits += 1;

    let sunk = false;
    if (ship.hits >= ship.length) {
      ship.sunk = true;
      sunk = true;

      const { start, end, orientation } = cell;
      const startRow = orientation === 'horizontal' ? row - 1 : start - 1;
      const endRow   = orientation === 'horizontal' ? row + 1 : end   + 1;
      const startCol = orientation === 'horizontal' ? start - 1 : col - 1;
      const endCol   = orientation === 'horizontal' ? end   + 1 : col + 1;

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r >= 0 && r <= 9 && c >= 0 && c <= 9 && state.attacks[r][c] === null) {
            state.attacks[r][c] = 0;
            autoMarked.push([r, c]);
          }
        }
      }
    }

    const allSunkNow = Object.values(state.ships).every((s) => s.sunk);

    return {
      valid:      true,
      result:     'hit',
      sunk,
      shipId:     cell.shipId,
      allSunk:    allSunkNow,
      autoMarked,
    };
  } else {
    state.attacks[row][col] = 0;

    return {
      valid:      true,
      result:     'miss',
      sunk:       false,
      shipId:     null,
      allSunk:    false,
      autoMarked: [],
    };
  }
}

function generateRandomCoords(attacks) {
  const candidates = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (attacks[r][c] === null) candidates.push([r, c]);
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Picks the next AI attack coordinates using the hunt/target algorithm.
 * Pure function — does not mutate anything.
 *
 * @param {number[][]} attacks   Player's attack grid (from computer's perspective)
 * @param {any[][]}    grid      Player's ship grid
 * @param {number[][]} huntMemory  Array of [row, col] of consecutive hits
 *
 * @returns {[number, number]}  [row, col]
 */
function getAICoords(attacks, grid, huntMemory) {
  if (huntMemory.length === 0) {
    return generateRandomCoords(attacks);
  }

  let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  if (huntMemory.length >= 2) {
    const [fr, fc] = huntMemory[0];
    const [lr, lc] = huntMemory[huntMemory.length - 1];
    directions = fr === lr
      ? [[0, 1], [0, -1]] 
      : [[1, 0], [-1, 0]];
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    const base     = huntMemory[Math.floor(Math.random() * huntMemory.length)];
    const ni = base[0] + dx;
    const nj = base[1] + dy;

    if (ni >= 0 && ni <= 9 && nj >= 0 && nj <= 9 && attacks[ni][nj] === null) {
      return [ni, nj];
    }
  }

  return generateRandomCoords(attacks);
}

function runComputerTurn(playerBoard, huntMemory) {
  const results = [];
  let keepGoing = true;

  while (keepGoing) {
    const coords = getAICoords(playerBoard.attacks, playerBoard.grid, huntMemory);
    if (!coords) break;

    const [row, col] = coords;
    const attackResult = processAttack(playerBoard, row, col);

    results.push({ row, col, ...attackResult });

    if (!attackResult.valid) break;

    if (attackResult.result === 'hit') {
      if (attackResult.sunk) {
        huntMemory.length = 0;
      } else {
        huntMemory.push([row, col]);
      }

      if (attackResult.allSunk) {
        keepGoing = false;
      }
    } else {
      keepGoing = false;
    }
  }

  return results;
}

module.exports = {
  makeEmptyGrid,
  makeEmptyAttacks,
  makeShipsMap,
  randomBoard,
  placeShip,
  processAttack,
  getAICoords,
  runComputerTurn,
};
