import type { IPlayer } from "~/matter/PlayerManager";

interface FinalScoreDisplayProps {
  players: IPlayer[];
  getWinnerPlayer: () => IPlayer;
  resetGame: () => void;
}

export default function FinalScoreDisplay({
  players,
  getWinnerPlayer,
  resetGame,
}: FinalScoreDisplayProps) {
  return (
    <div className="mt-6 text-center text-white">
      <h2 className="text-2xl mb-2">Final Scores</h2>
      {players.map((player) => (
        <div key={player.mac} className="text-xl">
          {player.mac}: {player.score}
        </div>
      ))}
      <h2 className="text-2xl mt-4">Winner:</h2>
      {players.length > 0 && (
        <div className="text-3xl font-bold">{getWinnerPlayer().mac}</div>
      )}
      <button
        className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
        onClick={resetGame}
      >
        Play Again
      </button>
    </div>
  );
}
