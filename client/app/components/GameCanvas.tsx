import { useEffect, useRef } from "react";
import { GameEngine } from "../matter/GameEngine";

export default function GameCanvas() {
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
        <div ref={wrapperRef}>
            <canvas ref={canvasRef} />
        </div>
    );
}
