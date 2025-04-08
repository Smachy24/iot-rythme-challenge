import { useEffect, useRef } from "react";
import Matter from "matter-js";

export default function Screen() {
    const canvaWrapper = useRef<HTMLDivElement>(null);
    const canvaRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Check if the canvas and wrapper are available
        if (!canvaRef.current || !canvaWrapper.current) return;

        const { Engine, Render, Runner, World, Bodies } = Matter;

        // The engine is for physics simulation
        const engine = Engine.create({});
        // The render object is for rendering the simulation
        const render = Render.create({
            element: canvaWrapper.current,
            engine: engine,
            canvas: canvaRef.current,
            options: {
                width: 1000,
                height: 700,
                wireframes: false,
                background: "#4944b9",
            },
        });

        const ball = Bodies.rectangle(50, 0, 50, 50, {
            frictionAir: 0.05,
            render: {
                fillStyle: "#c25a8d",
            },
        });

        const floor = Bodies.rectangle(0, 700, render.canvas.width * 2, 100, {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: "#c25a8d",
                opacity: 0.5,
            },
        });

        World.add(engine.world, [ball, floor]);
        Runner.run(Runner.create(), engine);
        Render.run(render);
    });

    return (
        <div ref={canvaWrapper}>
            <canvas ref={canvaRef} />
        </div>
    );
}
