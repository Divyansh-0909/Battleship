import React from 'react';
import { useBattleship } from './hooks/useBattleship';
import { Header, GameSetup, GameRunning, GameEnd } from './components/GameScreens';
import './styles.css';

export default function App() {
  const {
    phase,
    player1Grid,
    player1Attacks,
    player1Ships,
    player2Grid,
    player2Attacks,
    player2Ships,
    isPlayerTurn,
    winner,
    playerAttack,
    placeShip,
    randomizePlayer,
    resetPlayerBoard,
    startGame,
    leaveGame,
  } = useBattleship();

  return (
    <>
      <Header />
      <main className="main">
        {phase === 'initial' && (
          <GameSetup
            player1Grid={player1Grid}
            player1Attacks={player1Attacks}
            player1Ships={player1Ships}
            onPlaceShip={placeShip}
            onRandomize={randomizePlayer}
            onReset={resetPlayerBoard}
            onStart={startGame}
          />
        )}

        {phase === 'running' && (
          <GameRunning
            player1Grid={player1Grid}
            player1Attacks={player1Attacks}
            player1Ships={player1Ships}
            player2Grid={player2Grid}
            player2Attacks={player2Attacks}
            player2Ships={player2Ships}
            isPlayerTurn={isPlayerTurn}
            onAttack={playerAttack}
            onLeave={leaveGame}
          />
        )}

        {phase === 'end' && (
          <GameEnd winner={winner} onLeave={leaveGame} />
        )}
      </main>
    </>
  );
}
