import { useEffect, useRef } from "react";
import Matter from "matter-js";

const SQUARE_SIZE = 100;
const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 700;

const NUMBER_OF_COL = 4;
const COL_GAP = WORLD_WIDTH / NUMBER_OF_COL;
// Use _ to ignore the first argument
const COLUMNS_LIST = Array.from(
    { length: NUMBER_OF_COL },
    (_, i) => COL_GAP / 2 + i * COL_GAP
);

const SQUARE_LIST = [
    {
        column: 0,
        input: "a",
        color: "#c25a8d",
    },
    {
        column: 1,
        input: "z",
        color: "#c7ff76",
    },
    {
        column: 2,
        input: "e",
        color: "#76acff",
    },
    {
        column: 3,
        input: "r",
        color: "#9276ff",
    },
];

export default function Screen() {
    const canvaWrapper = useRef<HTMLDivElement>(null);
    const canvaRef = useRef<HTMLCanvasElement>(null);
    const { Engine, Render, Runner, World, Bodies, Events } = Matter;

    useEffect(() => {
        if (!canvaRef.current || !canvaWrapper.current) return;

        const engine = Engine.create();

        const render = Render.create({
            element: canvaWrapper.current,
            engine: engine,
            canvas: canvaRef.current,
            options: {
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                wireframes: false,
                background: "#15153d",
            },
        });

        const floor = Bodies.rectangle(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT - 50,
            WORLD_WIDTH,
            100,
            {
                isStatic: true,
                isSensor: true,
                label: "floor",
                render: {
                    fillStyle: "#c25a8d",
                    opacity: 0.5,
                },
            }
        );

        const activeBalls = new Set<Matter.Body>();
        const clickedBalls = new Set<Matter.Body>();

        const handleKeyDown = (event: KeyboardEvent) => {
            console.log(`Key pressed: ${event.key}`);

            activeBalls.forEach((ball) => {
                if (event.key === ball.plugin.inputValue) {
                    clickedBalls.add(ball);
                    World.remove(engine.world, ball);
                    console.log(`Ball removed with input "${event.key}"`);
                } else {
                    console.log(`Ball not removed with input "${event.key}"`);
                }
            });
        };

        window.addEventListener("keydown", handleKeyDown);

        Events.on(engine, "collisionStart", (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                const isBall = (b: Matter.Body) => b.label === "ball";
                const ball = isBall(bodyA)
                    ? bodyA
                    : isBall(bodyB)
                    ? bodyB
                    : null;

                if (ball) {
                    activeBalls.add(ball);
                }
            });
        });

        Events.on(engine, "collisionEnd", (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                const isBall = (b: Matter.Body) => b.label === "ball";
                const ball = isBall(bodyA)
                    ? bodyA
                    : isBall(bodyB)
                    ? bodyB
                    : null;

                if (ball) {
                    if (clickedBalls.has(ball)) {
                        console.log("Collision ended after correct input");
                    } else {
                        console.log(
                            "Collision ended without input (Game Over)"
                        );
                    }

                    activeBalls.delete(ball);
                    clickedBalls.delete(ball);
                }
            });
        });

        World.add(engine.world, [floor]);
        Runner.run(Runner.create(), engine);
        Render.run(render);

        const spawnInterval = setInterval(() => {
            const columnIndex = Math.floor(Math.random() * NUMBER_OF_COL);
            const { input, color } = SQUARE_LIST[columnIndex];

            const newBall = Bodies.rectangle(
                COLUMNS_LIST[columnIndex],
                0,
                COL_GAP,
                COL_GAP,
                {
                    frictionAir: 0.05,
                    label: "ball",
                    isSensor: true,
                    render: {
                        fillStyle: color,
                    },
                }
            );

            newBall.plugin = { inputValue: input };
            World.add(engine.world, newBall);
        }, Math.random() * 1000 + 500);

        // Clean up
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearInterval(spawnInterval);
        };
    }, []);

    return (
        <div ref={canvaWrapper}>
            <canvas ref={canvaRef} />
        </div>
    );
}
