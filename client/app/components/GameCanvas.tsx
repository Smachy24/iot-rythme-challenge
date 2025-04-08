import { useEffect, useRef } from "react";
import { GameEngine } from "../matter/GameEngine";

interface GameCanvasProps {
    borderColor?: string;
}

export default function GameCanvas({ borderColor }: GameCanvasProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !wrapperRef.current) return;

        engineRef.current = new GameEngine(
            wrapperRef.current,
            canvasRef.current
        );

        const interval = setInterval(() => {
            engineRef.current?.spawnBall();
        }, Math.random() * 1000 + 500);

        return () => {
            clearInterval(interval);
            engineRef.current?.destroy();
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="border-2"
            style={{ borderColor: borderColor }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}
