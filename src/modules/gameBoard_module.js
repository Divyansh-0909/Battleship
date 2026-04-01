import { Ship } from './ship_module.js';

function Gameboard(type) {
  let grid = Array(10)
    .fill(0)
    .map(() => Array(10).fill(0));

  const ships = [
    Ship(4),
    Ship(3),
    Ship(3),
    Ship(2),
    Ship(2),
    Ship(2),
    Ship(1),
    Ship(1),
    Ship(1),
    Ship(1),
  ];

  let attacks = Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));

  function checkSurronding(
    startCoordinateX,
    startCoordinateY,
    endCoordinateX,
    endCoordinateY,
  ) {
    for (let i = startCoordinateX - 1; i <= endCoordinateX + 1; i++) {
      for (let j = startCoordinateY - 1; j <= endCoordinateY + 1; j++) {
        if (i == -1 || i == 10 || j == -1 || j == 10) continue;
        if (i < -1 || i > 10 || j < -1 || j > 10) return false;
        if (grid[i][j] !== 0) return false;
      }
    }
    return true;
  }

  function placeShip(
    selectedShip,
    startCoordinateX,
    startCoordinateY,
    endCoordinateX,
    endCoordinateY,
  ) {
    let start;
    let end;

    if (startCoordinateX === endCoordinateX) {
      start = startCoordinateY;
      end = endCoordinateY;

      if (
        !checkSurronding(
          startCoordinateX,
          startCoordinateY,
          endCoordinateX,
          endCoordinateY,
        )
      ) {
        return false;
      }

      for (let i = start; i <= end; i++) {
        grid[startCoordinateX][i] = [selectedShip, start, end, 'horizontal'];
      }

      return true;
    } else {
      start = startCoordinateX;
      end = endCoordinateX;

      if (
        !checkSurronding(
          startCoordinateX,
          startCoordinateY,
          endCoordinateX,
          endCoordinateY,
        )
      ) {
        return false;
      }

      for (let i = start; i <= end; i++) {
        grid[i][startCoordinateY] = [selectedShip, start, end, 'vertical'];
      }

      return true;
    }
  }

  function randomizeShips(arr, index) {
    if (index < 0) return;

    const X = Math.floor(Math.random() * 10);
    const Y = Math.floor(Math.random() * 10);

    const length = arr[index].getLength();
    const randomOrientation = length === 1 ? 0 : Math.floor(Math.random() * 2);

    if (grid[X][Y] !== 0) return randomizeShips(arr, index);

    if (randomOrientation === 0) {
      // horizontal
      if (Y + length - 1 > 9) return randomizeShips(arr, index);

      if (!checkSurronding(X, Y, X, Y + length - 1))
        return randomizeShips(arr, index);

      placeShip(arr[index], X, Y, X, Y + length - 1);
    } else {
      // vertical
      if (X + length - 1 > 9) return randomizeShips(arr, index);

      if (!checkSurronding(X, Y, X + length - 1, Y))
        return randomizeShips(arr, index);

      placeShip(arr[index], X, Y, X + length - 1, Y);
    }

    return randomizeShips(arr, index - 1);
  }

  if (type === 'computer') {
    randomizeShips(ships, ships.length - 1);
  } else {
    placeShip(ships[0], 5, 3, 5, 6);
    placeShip(ships[1], 5, 1, 7, 1);
    placeShip(ships[2], 8, 3, 8, 5);
    placeShip(ships[3], 9, 0, 9, 1);
    placeShip(ships[4], 2, 0, 2, 1);
    placeShip(ships[5], 1, 7, 2, 7);
    placeShip(ships[6], 0, 0, 0, 0);
    placeShip(ships[7], 4, 9, 4, 9);
    placeShip(ships[8], 6, 8, 6, 8);
    placeShip(ships[9], 9, 9, 9, 9);
  }

  function receiveAttack(CoordinateX, CoordinateY) {
    if (grid[CoordinateX][CoordinateY] !== 0) {
      grid[CoordinateX][CoordinateY][0].hit();
      attacks[CoordinateX][CoordinateY] = 1;
    } else attacks[CoordinateX][CoordinateY] = 0;
  }

  function resetAttacks() {
    attacks = Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
  }

  function allSunk() {
    for (let i = 0; i < ships.length; i++) {
      if (!ships[i].isSunk()) return false;
    }
    return true;
  }

  function resetBoard() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        grid[i][j] = 0;
      }
    }
  }

  return {
    allSunk,
    placeShip,
    receiveAttack,
    attacks,
    ships,
    checkSurronding,
    grid,
    resetAttacks,
    randomizeShips,
    resetBoard,
  };
}

export { Gameboard };
