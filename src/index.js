import './styles.css';
import { Player } from './player_module.js';
import { createDisplay, createDropDown, createButtons } from './DOM.js';

//createDropDown();

let player1 = Player('Player1');
let player2 = Player('computer');

let display1;
let display2;
let displayContainer;
let state = 'initial';

function gameInitialise() {
  display1 = createDisplay(player1, 'initial', 'real');
  display2 = createDisplay(player2, 'initial', 'computer');
  console.log(player1.grid);
  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';

  displayContainer.append(display1);
  main.append(displayContainer);
}

let turn = true; //true-> user's turn to attack, false-> computer's turn to attack
let i; //x-coordinate for computer attacks
let j; //y-coordinate for computer attacks
let huntMemory = [];

function changeturn() {
  turn = !turn;
}

function handleAttack(hasHit) {
  if (hasHit === false) changeturn();
  renderDisplay(hasHit);
}

function computerAttack(i, j) {
  let cell = display1.querySelector(`[data-row="${i}"][data-col="${j}"]`);
  cell.click();
}

function generateRandomCoordinates() {
  do {
    i = Math.floor(Math.random() * 10);
    j = Math.floor(Math.random() * 10);
  } while (player1.attacks[i][j] !== null);
}

function gameEngine(hasHit) {
  display1 = createDisplay(player1, 'running', 'real', handleAttack);
  display2 = createDisplay(player2, 'running', 'computer', handleAttack);
  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';
  if (turn === true) {
    displayContainer.innerHTML = '';
    displayContainer.append(display2);
  } else {
    displayContainer.innerHTML = '';
    displayContainer.append(display1);

    //To add delay so that computer attacks after 400ms after display renders
    setTimeout(() => {
      if (hasHit && player1.grid[i][j] !== 0) {
        const hitShip = player1.grid[i][j][0];

        if (hitShip.isSunk()) {
          huntMemory = []; // Clear memory to resume random hunting.
        } else {
          huntMemory.push([i, j]);
        }
      }

      let newI, newJ;
      let validMove = false;

      if (huntMemory.length > 0) {
        let directions = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];

        // If we have 2+ hits, find the orientation dynamically
        if (huntMemory.length >= 2) {
          const firstHit = huntMemory[0];
          const lastHit = huntMemory[huntMemory.length - 1];

          if (firstHit[0] === lastHit[0]) {
            directions = [
              [0, 1],
              [0, -1],
            ];
          } else {
            directions = [
              [1, 0],
              [-1, 0],
            ];
          }
        }

        let attempts = 0; //To prevent infinite loops which can happen due to getting repeated random coordinates.
        do {
          const [dx, dy] =
            directions[Math.floor(Math.random() * directions.length)];

          // Branch off from a random known hit (prevents getting stuck if it hits the middle of a ship first)
          const baseHit =
            huntMemory[Math.floor(Math.random() * huntMemory.length)];

          newI = baseHit[0] + dx;
          newJ = baseHit[1] + dy;
          attempts++;

          if (
            newI >= 0 &&
            newI <= 9 &&
            newJ >= 0 &&
            newJ <= 9 &&
            player1.attacks[newI][newJ] === null
          ) {
            validMove = true;
          }
        } while (!validMove && attempts < 20);
      }

      if (validMove) {
        i = newI;
        j = newJ;
      } else {
        generateRandomCoordinates();
      }

      computerAttack(i, j);
    }, 400);
  }

  main.append(displayContainer);
}

function gameEnd() {
  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';

  const div = document.createElement('div');
  div.className = 'end';
  const h1 = document.createElement('h1');
  const h2 = document.createElement('h2');
  h1.textContent = 'GAME OVER!';

  if (player1.allSunk()) {
    h2.textContent = 'You lost!';
  } else if (player2.allSunk()) {
    h2.textContent = 'You won!';
  }

  div.append(h1, h2);
  displayContainer.append(div);
  main.append(displayContainer);
}

function renderDisplay(hasHit) {
  const main = document.querySelector('.main');
  main.innerHTML = '';
  if (player1.allSunk() || player2.allSunk()) {
    state = 'end';
    gameEnd();
    createButtons('running');
    const leaveButton = document.getElementById('leave');
    leaveButton.addEventListener('click', () => {
      state = 'initial';
      player1 = Player('Player1');
      player2 = Player('computer');
      renderDisplay();
    });
  }

  if (state === 'initial') {
    gameInitialise();
    createButtons(state);

    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => {
      player1 = Player('real');
      display1 = createDisplay(player1, 'initial', 'real');
      displayContainer.innerHTML = '';
      displayContainer.append(display1);
    });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
      state = 'running';
      renderDisplay();
    });

    const randomButton = document.getElementById('random');
    randomButton.addEventListener('click', () => {
      player1.resetBoard();
      player1.randomizeShips(player1.ships, player1.ships.length - 1);
      renderDisplay();
    });
  }

  if (state === 'running') {
    gameEngine(hasHit);
    createButtons(state);

    const leaveButton = document.getElementById('leave');
    leaveButton.addEventListener('click', () => {
      state = 'initial';
      player1 = Player('Player1');
      player2 = Player('computer');
      renderDisplay();
    });
  }
}

renderDisplay();
