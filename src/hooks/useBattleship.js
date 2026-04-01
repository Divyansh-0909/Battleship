import { useState, useCallback, useRef } from 'react';
import { Gameboard } from '../modules/gameBoard_module';

export function useBattleship() {
  const [phase, setPhase] = useState('initial');
  const player1Ref = useRef(Gameboard('realPlayer'));
  const player2Ref = useRef(Gameboard('computer'));
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  const turnRef = useRef(true);
  const huntMemoryRef = useRef([]);
  const lastAICoords = useRef({ i: 0, j: 0 });
  function generateRandomCoords(attacksGrid) {
    let i, j;
    do {
      i = Math.floor(Math.random() * 10);
      j = Math.floor(Math.random() * 10);
    } while (attacksGrid[i][j] !== null);
    return { i, j };
  }

  function getAICoords() {
    const p1 = player1Ref.current;
    const huntMemory = huntMemoryRef.current;

    if (huntMemory.length === 0) {
      return generateRandomCoords(p1.attacks);
    }

    let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    if (huntMemory.length >= 2) {
      const first = huntMemory[0];
      const last = huntMemory[huntMemory.length - 1];
      directions =
        first[0] === last[0]
          ? [[0, 1], [0, -1]]
          : [[1, 0], [-1, 0]];
    }

    let attempts = 0;
    while (attempts < 20) {
      const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
      const base = huntMemory[Math.floor(Math.random() * huntMemory.length)];
      const ni = base[0] + dx;
      const nj = base[1] + dy;

      if (ni >= 0 && ni <= 9 && nj >= 0 && nj <= 9 && p1.attacks[ni][nj] === null) {
        return { i: ni, j: nj };
      }
      attempts++;
    }

    return generateRandomCoords(p1.attacks);
  }
  const playerAttack = useCallback(
    (row, col) => {
      const p2 = player2Ref.current;
      if (!turnRef.current || p2.attacks[row][col] !== null) return;

      p2.receiveAttack(row, col);
      const isHit = p2.attacks[row][col] === 1;

      if (isHit) {
        const shipData = p2.grid[row][col];
        if (shipData && shipData[0].isSunk()) {
          const [, start, end, orientation] = shipData;
          const sr = orientation === 'horizontal' ? row - 1 : start - 1;
          const er = orientation === 'horizontal' ? row + 1 : end + 1;
          const sc = orientation === 'horizontal' ? start - 1 : col - 1;
          const ec = orientation === 'horizontal' ? end + 1 : col + 1;
          for (let r = sr; r <= er; r++) {
            for (let c = sc; c <= ec; c++) {
              if (r >= 0 && r <= 9 && c >= 0 && c <= 9 && p2.attacks[r][c] === null) {
                p2.attacks[r][c] = 0;
              }
            }
          }
        }
      }

      if (p2.allSunk()) {
        bump();
        setPhase('end');
        return;
      }

      if (!isHit) {
        turnRef.current = false;
        bump();
        setTimeout(() => runComputerTurn(), 600);
      } else {
        bump();
      }
    },
    [bump],
  );

  function runComputerTurn() {
    const p1 = player1Ref.current;
    const { i, j } = getAICoords();
    lastAICoords.current = { i, j };

    p1.receiveAttack(i, j);
    const isHit = p1.attacks[i][j] === 1;

    if (isHit) {
      const shipData = p1.grid[i][j];
      if (shipData) {
        if (shipData[0].isSunk()) {
          huntMemoryRef.current = [];
        } else {
          huntMemoryRef.current.push([i, j]);
        }
      }
    }

    if (p1.allSunk()) {
      bump();
      setPhase('end');
      return;
    }

    if (!isHit) {
      turnRef.current = true;
      bump();
    } else {
      bump();
      setTimeout(() => runComputerTurn(), 600);
    }
  }

  const placeShip = useCallback(
    (ship, startRow, startCol, endRow, endCol) => {
      const success = player1Ref.current.placeShip(ship, startRow, startCol, endRow, endCol);
      bump();
      return success;
    },
    [bump],
  );

  const randomizePlayer = useCallback(() => {
    const p1 = player1Ref.current;
    p1.resetBoard();
    p1.randomizeShips(p1.ships, p1.ships.length - 1);
    bump();
  }, [bump]);

  const resetPlayerBoard = useCallback(() => {
    player1Ref.current.resetBoard();
    bump();
  }, [bump]);

  const startGame = useCallback(() => {
    turnRef.current = true;
    huntMemoryRef.current = [];
    setPhase('running');
  }, []);

  const leaveGame = useCallback(() => {
    player1Ref.current = Gameboard('realPlayer');
    player2Ref.current = Gameboard('computer');
    turnRef.current = true;
    huntMemoryRef.current = [];
    setPhase('initial');
    bump();
  }, [bump]);

  const p1 = player1Ref.current;
  const p2 = player2Ref.current;

  const winner = phase === 'end' ? (p1.allSunk() ? 'computer' : 'player') : null;

  return {
    phase,

    player1Grid: p1.grid,
    player1Attacks: p1.attacks,
    player1Ships: p1.ships,

    player2Grid: p2.grid,
    player2Attacks: p2.attacks,
    player2Ships: p2.ships,

    isPlayerTurn: turnRef.current,

    winner,

    playerAttack,
    placeShip,
    randomizePlayer,
    resetPlayerBoard,
    startGame,
    leaveGame,
  };
}
