import { useEffect, useRef, useState } from "react";
import { musicTracks } from "~/data/musicTrack";
import { COLORS } from "~/theme/colors";
import GameCanvas from "./GameCanvas";
import { usePlayerManager } from "~/matter/hooks/usePlayerManager";
import type { IPlayer } from "~/matter/PlayerManager";
import { PLAYERS_COLORS } from "~/constants/gameConfig";

// Todo: add dynamically player canvas, and maybe add a text when there is no players ?

export default function GameBoard() {
  const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shouldStart, setShouldStart] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameInstanceId, setGameInstanceId] = useState(0);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const { players, manager } = usePlayerManager();

  const startGame = () => {
    const music = new Audio(selectedTrack.audioSrc);
    bgMusicRef.current = music;
    music.volume = 0.5;
    music.loop = false;

    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        music.play();
        setShouldStart(true);
        setGameStarted(true);

        music.onended = () => {
          setShouldStart(false);
          setGameOver(true);
        };
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setShouldStart(false);
    setGameOver(false);
    setCountdown(null);
    manager.resetScores();
    setGameInstanceId((id) => id + 1);
  };

  const getWinnerPlayer = (): IPlayer => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return sortedPlayers[0];
  };

  useEffect(() => {
    return () => {
      bgMusicRef.current?.pause();
      bgMusicRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-7 items-center">
      <h1 className="text-4xl">Rythme Challenge</h1>

      {!gameStarted && (
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white">Select Music Track</h2>
          <select
            className="text-black p-1"
            onChange={(e) => {
              const track = musicTracks.find((m) => m.name === e.target.value);
              if (track) setSelectedTrack(track);
            }}
            value={selectedTrack.name}
          >
            {musicTracks.map((track) => (
              <option key={track.name} value={track.name}>
                {track.name} (BPM: {track.bpm})
              </option>
            ))}
          </select>

          {players.length !== 0 && selectedTrack !== null && (
            <button
              onClick={startGame}
              className=" px-4 py-1 bg-pink-500 text-white"
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {countdown !== null && (
        <div className="text-4xl font-bold text-white animate-pulse">
          {countdown === 1 ? "GO!" : countdown}
        </div>
      )}

      {gameOver && (
        <div className="mt-6 text-center text-white">
          <h2 className="text-2xl mb-2">Final Scores</h2>

          {players.map((player) => (
            <div key={player.mac} className="text-xl">
              {player.mac}: {player.score}
            </div>
          ))}
          <h2 className="text-2xl mt-4">Winner: </h2>
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
      )}
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
    </div>
  );
}
