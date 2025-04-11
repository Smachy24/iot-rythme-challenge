import { playerManager, type IPlayer } from "~/matter/PlayerManager";
import { Button } from "./Button";

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
    <div className="flex flex-col gap-3 text-center text-white">
      <h2 className="text-2xl mt-4">Winner:</h2>
      {players.length > 0 && (
        <div className="text-3xl font-bold">{playerManager.getPlayerName(getWinnerPlayer())}</div>
      )}

      <Button onClick={resetGame}>Play Again</Button>
    </div>
  );
}
