const {
  makeEmptyGrid,
  makeShipsMap,
  randomBoard,
  placeShip,
  processAttack,
  getAICoords,
  runComputerTurn,
} = require('../src/gameEngine');


describe('placeShip', () => {
  test('places a horizontal ship correctly', () => {
    const grid = makeEmptyGrid();
    const ok = placeShip(grid, 'ship_0', 0, 0, 0, 3);
    expect(ok).toBe(true);
    expect(grid[0][0]).toMatchObject({ shipId: 'ship_0', orientation: 'horizontal' });
    expect(grid[0][3]).toMatchObject({ shipId: 'ship_0', orientation: 'horizontal' });
    expect(grid[0][4]).toBeNull();
  });

  test('places a vertical ship correctly', () => {
    const grid = makeEmptyGrid();
    const ok = placeShip(grid, 'ship_1', 0, 5, 2, 5);
    expect(ok).toBe(true);
    expect(grid[0][5]).toMatchObject({ shipId: 'ship_1', orientation: 'vertical' });
    expect(grid[2][5]).toMatchObject({ shipId: 'ship_1', orientation: 'vertical' });
  });

  test('rejects out-of-bounds placement', () => {
    const grid = makeEmptyGrid();
    expect(placeShip(grid, 'ship_0', 0, 8, 0, 11)).toBe(false);
  });

  test('rejects overlapping ships', () => {
    const grid = makeEmptyGrid();
    placeShip(grid, 'ship_0', 3, 3, 3, 6);
    expect(placeShip(grid, 'ship_1', 3, 5, 3, 7)).toBe(false);
  });

  test('rejects adjacent ships (surrounding check)', () => {
    const grid = makeEmptyGrid();
    placeShip(grid, 'ship_0', 3, 3, 3, 6);
    expect(placeShip(grid, 'ship_1', 2, 3, 2, 6)).toBe(false);
  });

  test('rejects diagonal ships', () => {
    const grid = makeEmptyGrid();
    expect(placeShip(grid, 'ship_0', 0, 0, 2, 2)).toBe(false);
  });
});

describe('randomBoard', () => {
  test('places exactly 10 ships', () => {
    const { ships } = randomBoard();
    expect(Object.keys(ships)).toHaveLength(10);
  });

  test('all ships start with 0 hits and not sunk', () => {
    const { ships } = randomBoard();
    Object.values(ships).forEach((s) => {
      expect(s.hits).toBe(0);
      expect(s.sunk).toBe(false);
    });
  });

  test('no two ships occupy the same cell', () => {
    const { grid } = randomBoard();
    const seen = new Set();
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (grid[r][c] !== null) {
          const key = `${r},${c}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
    }
  });
});

function makeTestBoard() {
  const grid  = makeEmptyGrid();
  const ships = makeShipsMap();
  const attacks = Array.from({ length: 10 }, () => Array(10).fill(null));

  placeShip(grid, 'ship_0', 2, 3, 2, 6);

  return { grid, ships, attacks };
}

describe('processAttack', () => {
  test('returns miss for empty cell', () => {
    const state = makeTestBoard();
    const result = processAttack(state, 0, 0);
    expect(result.valid).toBe(true);
    expect(result.result).toBe('miss');
    expect(state.attacks[0][0]).toBe(0);
  });

  test('returns hit for occupied cell', () => {
    const state = makeTestBoard();
    const result = processAttack(state, 2, 3);
    expect(result.valid).toBe(true);
    expect(result.result).toBe('hit');
    expect(result.shipId).toBe('ship_0');
    expect(state.attacks[2][3]).toBe(1);
    expect(state.ships['ship_0'].hits).toBe(1);
  });

  test('detects sunk ship after all cells hit', () => {
    const state = makeTestBoard();
    processAttack(state, 2, 3);
    processAttack(state, 2, 4);
    processAttack(state, 2, 5);
    const result = processAttack(state, 2, 6);
    expect(result.sunk).toBe(true);
    expect(state.ships['ship_0'].sunk).toBe(true);
  });

  test('auto-marks surrounding cells as miss after sinking', () => {
    const state = makeTestBoard();
    processAttack(state, 2, 3);
    processAttack(state, 2, 4);
    processAttack(state, 2, 5);
    const result = processAttack(state, 2, 6);
    expect(result.autoMarked.length).toBeGreaterThan(0);
    result.autoMarked.forEach(([r, c]) => {
      expect(state.attacks[r][c]).toBe(0);
    });
  });

  test('rejects already attacked cell', () => {
    const state = makeTestBoard();
    processAttack(state, 0, 0);
    const result = processAttack(state, 0, 0);
    expect(result.valid).toBe(false);
    expect(result.result).toBe('already_attacked');
  });

  test('rejects out-of-bounds coordinates', () => {
    const state = makeTestBoard();
    expect(processAttack(state, -1, 0).valid).toBe(false);
    expect(processAttack(state, 10, 0).valid).toBe(false);
    expect(processAttack(state, 0, 10).valid).toBe(false);
  });

  test('detects allSunk when last ship is sunk', () => {
    const grid    = makeEmptyGrid();
    const ships   = { ship_9: { length: 1, hits: 0, sunk: false } };
    const attacks = Array.from({ length: 10 }, () => Array(10).fill(null));
    placeShip(grid, 'ship_9', 5, 5, 5, 5);

    const state = { grid, ships, attacks };
    const result = processAttack(state, 5, 5);
    expect(result.allSunk).toBe(true);
  });
});

describe('runComputerTurn', () => {
  test('returns at least one result', () => {
    const { grid, ships } = randomBoard();
    const attacks = Array.from({ length: 10 }, () => Array(10).fill(null));
    const huntMemory = [];
    const results = runComputerTurn({ grid, ships, attacks }, huntMemory);
    expect(results.length).toBeGreaterThan(0);
  });

  test('stops after a miss', () => {
    const grid    = makeEmptyGrid();
    const ships   = {};
    const attacks = Array.from({ length: 10 }, () => Array(10).fill(null));
    const results = runComputerTurn({ grid, ships, attacks }, []);
    expect(results).toHaveLength(1);
    expect(results[0].result).toBe('miss');
  });
});
