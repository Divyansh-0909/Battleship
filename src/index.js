import './styles.css';
import { Player } from './player_module.js';
import { createDisplay, createDropDown } from './DOM.js';

const player1 = Player('real');

createDropDown();
createDisplay(player1);
