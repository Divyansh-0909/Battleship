import './styles.css';
import { Player } from './player_module.js';
import { createDisplay, createDropDown, createButtons } from './DOM.js';

createDropDown();

let player1 = Player('Player1');
const player2 = Player('computer');

let display1;
let display2;
let displayContainer;
let state = 'initial';

function gameInitialise() {
  display1 = createDisplay(player1, 'initial', 'real');
  display2 = createDisplay(player2, 'initial', 'computer');

  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';

  displayContainer.append(display1);
  main.append(displayContainer);
}

let turn = true;

function changeturn() {
  turn = !turn;
}

function handleAttack() {
  changeturn();
  renderDisplay();
}

function gameEngine() {
  display1 = createDisplay(player1, 'running', 'real', handleAttack);
  display2 = createDisplay(player2, 'running', 'computer', handleAttack);
  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';
  if (turn === true) {
    displayContainer.innerHTML = '';
    displayContainer.append(display1);
  } else {
    displayContainer.innerHTML = '';
    displayContainer.append(display2);
  }
  main.append(displayContainer);
}

function renderDisplay() {
  const main = document.querySelector('.main');
  main.innerHTML = '';

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
  }

  if (state === 'running') {
    gameEngine();
    createButtons(state);

    const leaveButton = document.getElementById('leave');
    leaveButton.addEventListener('click', () => {
      state = 'initial';
      renderDisplay();
    });
  }
}

renderDisplay();
