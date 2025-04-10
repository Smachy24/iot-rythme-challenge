import { useEffect, useRef, useState } from "react";
import MusicTrackSelector from "./MusicTrackSelector";
import CountdownDisplay from "./CountdownDisplay";
import FinalScoreDisplay from "./FinalScoreDisplay";
import GamePlayArea from "./GamePlayArea";
import { musicTracks } from "~/data/musicTrack";
import { usePlayerManager } from "~/matter/hooks/usePlayerManager";
import type { IPlayer } from "~/matter/PlayerManager";

export default function GameBoard() {
  const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shouldStart, setShouldStart] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameInstanceId, setGameInstanceId] = useState(0);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const { players, playerManager } = usePlayerManager();

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
    playerManager.resetScores();
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
        <>
          <MusicTrackSelector
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            startGame={startGame}
            players={players}
          />
          {players.length !== 0 && (
            <button
              onClick={startGame}
              className="px-4 py-1 bg-pink-500 text-white"
            >
              Start Game
            </button>
          )}
        </>
      )}

      {countdown !== null && <CountdownDisplay countdown={countdown} />}

      {gameOver && (
        <FinalScoreDisplay
          players={players}
          getWinnerPlayer={getWinnerPlayer}
          resetGame={resetGame}
        />
      )}

      <GamePlayArea
        players={players}
        playerManager={playerManager}
        selectedTrack={selectedTrack}
        shouldStart={shouldStart}
        gameInstanceId={gameInstanceId}
      />
    </div>
  );
}
