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

  let missed = new Array();

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

  if (type === 'computer') {
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

  if (type === 'real') {
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
    if (grid[CoordinateX][CoordinateY] !== 0)
      grid[CoordinateX][CoordinateY][1].hit();
    else missed.push(CoordinateX, CoordinateY);
  }

  function allSunk() {
    for (let i = 0; i < ships.length; i++) {
      if (!ships[i].isSunk()) return false;
    }
    return true;
  }

  return {
    allSunk,
    placeShip,
    receiveAttack,
    missed,
    ships,
    checkSurronding,
    grid,
  };
}

export { Gameboard };
