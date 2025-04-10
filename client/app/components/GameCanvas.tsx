import { useEffect, useRef, useState } from "react";
import { musicTracks, type MusicTrack } from "~/data/musicTrack";
import { SCORE_COLOR_MAPPING, type ScoreLabel } from "~/matter/utils/score";
import { GameEngine } from "../matter/GameEngine";
import type { IPlayer, PlayerManager } from "~/matter/PlayerManager";
import seedrandom from "seedrandom";

interface GameCanvasProps {
  player: IPlayer;
  playerManager: PlayerManager;
  borderColor?: string;
  selectedTrack: MusicTrack;
  shouldStart: boolean;
  onFinalScore?: (score: number) => void;
}

export default function GameCanvas({
  player,
  playerManager,
  borderColor,
  selectedTrack,
  shouldStart,
  onFinalScore,
}: GameCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scoreLabel, setScoreLabel] = useState<ScoreLabel | null>(null);
  const [score, setScore] = useState(0);

  const onScoreChange = (score: number, label: ScoreLabel) => {
    setScoreLabel(label);
    setScore((prevScore) => prevScore + score);
  };

  useEffect(() => {
    if (!shouldStart) {
      if (engineRef.current) {
        onFinalScore?.(player.score);
      }
      return;
    }
    if (!canvasRef.current || !wrapperRef.current) return;

    const noteSound = new Audio("/public/assets/sounds/drum_kick.wav");
    const beatInterval = 60000 / selectedTrack.bpm;
    const pnrg = seedrandom(selectedTrack.name);

    engineRef.current = new GameEngine(
      wrapperRef.current,
      canvasRef.current,
      player.mac,
      playerManager,
      noteSound,
      pnrg,
      onScoreChange
    );

    spawnIntervalRef.current = setInterval(() => {
      engineRef.current?.spawnMusicNote();
    }, beatInterval);

    return () => {
      spawnIntervalRef.current && clearInterval(spawnIntervalRef.current);
      engineRef.current?.destroy();
    };
  }, [shouldStart]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-white text-2xl">P{player.keybindId}</h2>
      <div
        ref={wrapperRef}
        className="border-2"
        style={{ borderColor: borderColor }}
      >
        <canvas ref={canvasRef} />
      </div>
      <p className="text-white text-2xl mt-2">{score}</p>
      {scoreLabel && (
        <p style={{ color: SCORE_COLOR_MAPPING[scoreLabel] }}>{scoreLabel}</p>
      )}
    </div>
  );
}
