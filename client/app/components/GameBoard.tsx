import { useEffect, useRef, useState } from "react";
import MusicTrackSelector from "./MusicTrackSelector";
import CountdownDisplay from "./CountdownDisplay";
import FinalScoreDisplay from "./FinalScoreDisplay";
import GamePlayArea from "./GamePlayArea";
import { musicTracks } from "~/data/musicTrack";
import { usePlayerManager } from "~/matter/hooks/usePlayerManager";
import type { IPlayer } from "~/matter/PlayerManager";
import { Button } from "./Button";
import { Title } from "./Title";

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
        music.volume = 0.1;
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
    <div className="flex flex-col gap-14 items-center">
      <Title>Rythme Challenge</Title>

      {!gameStarted && (
        <MusicTrackSelector
          selectedTrack={selectedTrack}
          setSelectedTrack={setSelectedTrack}
          startGame={startGame}
          players={players}
        />
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

      {!gameStarted && players.length !== 0 && (
        <Button onClick={startGame}>Start Game</Button>
      )}
    </div>
  );
}
