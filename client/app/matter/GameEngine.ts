import Matter from "matter-js";
import { COLORS } from "../theme/colors";
import {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    COLUMNS_LIST,
    SQUARE_LIST,
    COL_GAP,
    NUMBER_OF_COL,
} from "../constants/gameConfig";

export class GameEngine {
    private engine: Matter.Engine;
    private render: Matter.Render;
    private runner: Matter.Runner;
    // Active balls are the balls that are currently in the world and colliding with the floor
    private activeBalls: Set<Matter.Body> = new Set();
    // Clicked balls are the balls that are currently colliding with the floor and have been clicked
    private clickedBalls: Set<Matter.Body> = new Set();

    constructor(
        container: HTMLElement,
        canvas: HTMLCanvasElement,
        width: number = WORLD_WIDTH,
        height: number = WORLD_HEIGHT,
        backgroundColor: string = COLORS.background
    ) {
        // The engine is used to create the physics world
        this.engine = Matter.Engine.create();
        // The runner is used to run the engine
        this.runner = Matter.Runner.create();
        // The render is used to create the canvas
        this.render = Matter.Render.create({
            element: container,
            engine: this.engine,
            canvas: canvas,
            options: {
                width: width,
                height: height,
                wireframes: false, // Enable wireframes for debugging
                background: backgroundColor,
            },
        });

        this.init();
    }

    private init() {
        this.addLimit();
        this.registerEvents();
        Matter.Runner.run(this.runner, this.engine);
        Matter.Render.run(this.render);
    }

    private addLimit() {
        const floor = Matter.Bodies.rectangle(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT - 50,
            WORLD_WIDTH,
            100,
            {
                isStatic: true,
                isSensor: true,
                label: "floor",
                render: {
                    fillStyle: "black",
                    opacity: 0.1,
                },
            }
        );
        Matter.World.add(this.engine.world, floor);
    }

    private registerEvents() {
        window.addEventListener("keydown", this.handleKeyDown);
        // Handle collision events
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            // Event contains the elements that are colliding
            // We need to use forEach because the event.pairs is an array that contains the elements that are colliding
            event.pairs.forEach(({ bodyA, bodyB }) => {
                // We just have to check if the bodyA or bodyB is the ball because the ball is the only element that can collide with the floor
                if (bodyA.label === "ball" || bodyB.label === "ball") {
                    const ball = bodyA.label === "ball" ? bodyA : bodyB;
                    this.activeBalls.add(ball);
                }
            });
        });

        Matter.Events.on(this.engine, "collisionEnd", (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                if (bodyA.label === "ball" || bodyB.label === "ball") {
                    const ball = bodyA.label === "ball" ? bodyA : bodyB;
                    this.activeBalls.delete(ball);
                    this.clickedBalls.delete(ball);
                }
            });
        });
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.activeBalls.forEach((ball) => {
            if (event.key === ball.plugin.inputValue) {
                this.clickedBalls.add(ball);
                Matter.World.remove(this.engine.world, ball);
                console.log(`Ball with input "${event.key}" removed`);
            }
        });
    };

    public spawnBall(fallSpeed: number = 0.05) {
        const columnIndex = Math.floor(Math.random() * NUMBER_OF_COL);
        const { input, color } = SQUARE_LIST[columnIndex];

        const newBall = Matter.Bodies.rectangle(
            COLUMNS_LIST[columnIndex],
            0,
            COL_GAP,
            COL_GAP,
            {
                frictionAir: fallSpeed,
                label: "ball",
                isSensor: true,
                render: {
                    fillStyle: color,
                },
            }
        );

        newBall.plugin = { inputValue: input };
        Matter.World.add(this.engine.world, newBall);
    }

    public destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);
        Matter.World.clear(this.engine.world, false);
        Matter.Engine.clear(this.engine);
    }
}
