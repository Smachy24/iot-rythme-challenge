import { useEffect, useRef, useState } from "react";
import { SCORE_COLOR_MAPPING, type ScoreLabel } from "~/matter/utils/score";
import { GameEngine } from "../matter/GameEngine";

interface GameCanvasProps {
    playerMac: string;
    borderColor?: string;
}

export default function GameCanvas({ playerMac, borderColor }: GameCanvasProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [score, setScore] = useState(0);
    const [scoreLabel, setScoreLabel] = useState<ScoreLabel | null>(null);

    const onScoreChange = (score: number, label: ScoreLabel) => {
        setScore((prevScore) => prevScore + score);
        setScoreLabel(label);
    };

    const bpm = 95;
    const beatInterval = 60000 / bpm; // in milliseconds

    useEffect(() => {
        if (!canvasRef.current || !wrapperRef.current) return;

        const noteSound = new Audio("/assets/sounds/drum_kick.wav");
        engineRef.current = new GameEngine(
            wrapperRef.current,
            canvasRef.current,
            playerMac,
            noteSound,
            onScoreChange
        );

        const interval = setInterval(() => {
            engineRef.current?.spawnMusicNote();
        }, beatInterval);

        return () => {
            clearInterval(interval);
            engineRef.current?.destroy();
        };
    }, []);

    return (
        <div>
            <div
                ref={wrapperRef}
                className="border-2"
                style={{ borderColor: borderColor }}
            >
                <canvas ref={canvasRef} />
            </div>
            <h1 className="text-white">{score}</h1>
            {scoreLabel && (
                <h1 style={{ color: SCORE_COLOR_MAPPING[scoreLabel] }}>
                    {scoreLabel}
                </h1>
            )}
        </div>
    );
}
