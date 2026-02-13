import { Gameboard } from './gameBoard_module.js';

function Player(type) {
  if (type === 'computer') return Gameboard('computer');
  return Gameboard('real');
}

export { Player };
