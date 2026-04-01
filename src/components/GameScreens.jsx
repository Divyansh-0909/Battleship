import React from 'react';
import { Board } from './Board';

export function GameSetup({
  player1Grid,
  player1Attacks,
  player1Ships,
  onPlaceShip,
  onRandomize,
  onReset,
  onStart,
}) {
  return (
    <div className="game-setup">
      <div className="side-buttons side-buttons--left" style={{ transform: 'rotate(-20deg)' }}>
        <ActionButton id="random" label="Random" onClick={onRandomize} active />
        <ActionButton id="reset" label="Reset" onClick={onReset} active />
      </div>

      <div className="board-wrapper">
        <Board
          grid={player1Grid}
          attacks={player1Attacks}
          ships={player1Ships}
          mode="placement"
          onPlaceShip={onPlaceShip}
          label="Place your Ships!"
        />
      </div>

      {/* Right — pill red: Start / Leave */}
      <div className="side-buttons side-buttons--right" style={{ transform: 'rotate(20deg)' }}>
        <ActionButton id="start" label="Start" onClick={onStart} active />
        <ActionButton id="leave" label="Leave" active={false} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GameRunning — shown during 'running' phase
// ─────────────────────────────────────────────────────────────────────────────
export function GameRunning({
  player1Grid,
  player1Attacks,
  player1Ships,
  player2Grid,
  player2Attacks,
  player2Ships,
  isPlayerTurn,
  onAttack,
  onLeave,
}) {
  const p2Remaining = player2Ships.filter((s) => !s.isSunk()).length;
  const p1Remaining = player1Ships.filter((s) => !s.isSunk()).length;

  return (
    <div className="game-running">
      {/* Left — round grey (inactive during running) */}
      <div className="side-buttons side-buttons--left" style={{ transform: 'rotate(-20deg)' }}>
        <ActionButton id="random" label="Random" active={false} />
        <ActionButton id="reset" label="Reset" active={false} />
      </div>

      {/* Centre — one board visible at a time */}
      <div className="board-wrapper">
        {isPlayerTurn ? (
          <Board
            grid={player2Grid}
            attacks={player2Attacks}
            ships={player2Ships}
            mode="attack"
            onAttack={onAttack}
            label={`Your turn | Ships: ${p2Remaining}`}
          />
        ) : (
          <Board
            grid={player1Grid}
            attacks={player1Attacks}
            ships={player1Ships}
            mode="defend"
            label={`Computer's turn | Ships: ${p1Remaining}`}
          />
        )}
      </div>

      {/* Right — pill red: Start (inactive) / Leave */}
      <div className="side-buttons side-buttons--right" style={{ transform: 'rotate(20deg)' }}>
        <ActionButton id="start" label="Start" active={false} />
        <ActionButton id="leave" label="Leave" onClick={onLeave} active />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GameEnd — shown during 'end' phase
// ─────────────────────────────────────────────────────────────────────────────
export function GameEnd({ winner, onLeave }) {
  return (
    <div className="game-end">
      {/* Left — round grey (all inactive) */}
      <div className="side-buttons side-buttons--left" style={{ transform: 'rotate(-20deg)' }}>
        <ActionButton id="random" label="Random" active={false} />
        <ActionButton id="reset" label="Reset" active={false} />
      </div>

      <div className="end">
        <h1>GAME OVER!</h1>
        <h2>{winner === 'player' ? 'You won! 🎉' : 'You lost!'}</h2>
      </div>

      {/* Right — pill red: Start (inactive) / Leave */}
      <div className="side-buttons side-buttons--right" style={{ transform: 'rotate(20deg)' }}>
        <ActionButton id="start" label="Start" active={false} />
        <ActionButton id="leave" label="Leave" onClick={onLeave} active />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
export function Header() {
  return (
    <header className="header">
      <h1>BATTLESHIP</h1>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ActionButton — reusable button + label fieldset
// ─────────────────────────────────────────────────────────────────────────────
function ActionButton({ id, label, onClick, active }) {
  return (
    <fieldset className={active ? 'Active' : 'inActive'}>
      <button
        id={id}
        name={id}
        onClick={active && onClick ? onClick : undefined}
        disabled={!active}
      />
      <label htmlFor={id}>{label}</label>
    </fieldset>
  );
}
