import './styles.css';
import { Player } from './player_module.js';
import { createDisplay, createDropDown } from './DOM.js';

createDropDown();

const player1 = Player('real');
const player2 = Player('computer');

function gameEngine() {
  let display1 = createDisplay(player1);
  let display2 = createDisplay(player2);

  let turn = true; //true -> p1's turn, false -> p2's turn

  const main = document.querySelector('.main');
  const displayContainer = document.createElement('div');
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

  main.append(displayContainer);
  isTurn();
}

gameEngine('initial');
