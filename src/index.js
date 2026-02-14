import './styles.css';
import { Player } from './player_module.js';
import { createDisplay, createDropDown, createButtons } from './DOM.js';

createDropDown();

let player1 = Player('real');
const player2 = Player('computer');

let display1;
let display2;
let displayContainer;

function gameEngine() {
  display1 = createDisplay(player1);
  display2 = createDisplay(player2);
  let turn = true; //true -> p1's turn, false -> p2's turn

  const main = document.querySelector('.main');
  displayContainer = document.createElement('div');
  displayContainer.className = 'container';

  function isTurn() {
    displayContainer.innerHTML = '';
    if (turn) {
      displayContainer.append(display1);
    } else {
      displayContainer.append(display2);
    }
    turn = !turn;
  }

  isTurn();
  main.append(displayContainer);
}

gameEngine('initial');
createButtons();

const buttonReset = document.getElementById('reset');

buttonReset.addEventListener('click', () => {
  player1 = Player('real');
  display1 = createDisplay(player1);
  displayContainer.innerHTML = '';
  displayContainer.append(display1);
});
