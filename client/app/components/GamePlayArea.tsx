import GameCanvas from "./GameCanvas";
import { PLAYERS_COLORS } from "~/constants/gameConfig";
import type { IPlayer, PlayerManager } from "~/matter/PlayerManager";

interface GamePlayAreaProps {
  players: IPlayer[];
  playerManager: PlayerManager;
  selectedTrack: { name: string; bpm: number; audioSrc: string };
  shouldStart: boolean;
  gameInstanceId: number;
}

export default function GamePlayArea({
  players,
  playerManager: manager,
  selectedTrack,
  shouldStart,
  gameInstanceId,
}: GamePlayAreaProps) {
  return (
    <div className="flex gap-32">
      {players.map((player) => (
        <GameCanvas
          key={`player-${player.mac}-${gameInstanceId}`}
          player={player}
          playerManager={manager}
          borderColor={PLAYERS_COLORS[player.keybindId]}
          selectedTrack={selectedTrack}
          shouldStart={shouldStart}
        />
      ))}
    </div>
  );
}
