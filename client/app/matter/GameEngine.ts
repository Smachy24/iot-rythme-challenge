import Matter from "matter-js";
import { COLORS } from "../theme/colors";
import {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    COLUMNS_LIST,
    MUSIC_NOTE_LIST,
    COL_GAP,
    NUMBER_OF_COL,
    MUSIC_NOTE_LABEL,
} from "../constants/gameConfig";
import { getScore, SCORE_MAPPING, type ScoreLabel } from "./utils/score";

export class GameEngine {
    private engine: Matter.Engine;
    private render: Matter.Render;
    private runner: Matter.Runner;
    // Active music notes are the music notes that are currently in the world and colliding with the good timing box
    private musicNotesCollidingWithTimingBox: Set<Matter.Body> = new Set();
    // Pressed music note are the music note that are currently colliding with the floor and have been pressed
    private pressedMusicNotesCollidingWithTimingBox: Set<Matter.Body> =
        new Set();
    private goodTimingBoxPosition: Matter.Vector;
    private maxValidYPosition: number;
    private onScoreChange?: (score: number, label: ScoreLabel) => void;

    constructor(
        container: HTMLElement,
        canvas: HTMLCanvasElement,
        onScoreChange?: (score: number, label: ScoreLabel) => void,
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
                showAngleIndicator: true,
                // showCollisions: true,
                // showConvexHulls: true,
                // showBroadphase: true,
            },
        });
        this.goodTimingBoxPosition = { x: 0, y: 0 };
        this.maxValidYPosition = COL_GAP;
        this.onScoreChange = onScoreChange;
        this.init();
    }

    private init() {
        this.addGoodTimingBox();
        this.registerEvents();
        Matter.Runner.run(this.runner, this.engine);
        Matter.Render.run(this.render);
    }

    private addGoodTimingBox() {
        const goodTimingBox = Matter.Bodies.rectangle(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT - 50,
            WORLD_WIDTH,
            100,
            {
                isStatic: true,
                isSensor: true,
                label: "goodTimingBox",
                render: {
                    fillStyle: "white",
                    opacity: 1,
                },
            }
        );
        this.goodTimingBoxPosition = goodTimingBox.position;
        Matter.World.add(this.engine.world, goodTimingBox);
    }

    private registerEvents() {
        window.addEventListener("keydown", this.handleKeyDown);
        // Handle collision events
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            // Event contains the elements that are colliding
            // We need to use forEach because the event.pairs is an array that contains the elements that are colliding
            event.pairs.forEach(({ bodyA, bodyB }) => {
                // We just have to check if the bodyA or bodyB is the ball because the ball is the only element that can collide with the floor
                if (
                    bodyA.label === MUSIC_NOTE_LABEL ||
                    bodyB.label === MUSIC_NOTE_LABEL
                ) {
                    const ball =
                        bodyA.label === MUSIC_NOTE_LABEL ? bodyA : bodyB;
                    this.musicNotesCollidingWithTimingBox.add(ball);
                }
            });
        });

        Matter.Events.on(this.engine, "collisionEnd", (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                if (
                    bodyA.label === MUSIC_NOTE_LABEL ||
                    bodyB.label === MUSIC_NOTE_LABEL
                ) {
                    const ball =
                        bodyA.label === MUSIC_NOTE_LABEL ? bodyA : bodyB;
                    if (
                        this.musicNotesCollidingWithTimingBox.has(ball) &&
                        !this.pressedMusicNotesCollidingWithTimingBox.has(ball)
                    ) {
                        const { score, label } = SCORE_MAPPING.miss;
                        this.updateScore(score, label);
                        console.log("You missed the note");
                    }
                    this.pressedMusicNotesCollidingWithTimingBox.delete(ball);
                    this.musicNotesCollidingWithTimingBox.delete(ball);
                }
            });
        });
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.musicNotesCollidingWithTimingBox.forEach((ball) => {
            if (event.key === ball.plugin.inputValue) {
                this.pressedMusicNotesCollidingWithTimingBox.add(ball);
                const yPositionFromGoodLimit =
                    this.getYDistanceBetweenTwoBodiesPosition(
                        ball.position,
                        this.goodTimingBoxPosition
                    );
                const { score, label } = getScore(
                    yPositionFromGoodLimit,
                    this.maxValidYPosition
                );
                this.updateScore(score, label);
                console.log(label);
                Matter.World.remove(this.engine.world, ball);
            }
        });
    };

    private updateScore(score: number, label: ScoreLabel) {
        this.onScoreChange?.(score, label);
    }

    public spawnMusicNote(fallSpeed: number = 0.05) {
        const columnIndex = Math.floor(Math.random() * NUMBER_OF_COL);
        const { input, color } = MUSIC_NOTE_LIST[columnIndex];

        const newMusicNote = Matter.Bodies.rectangle(
            COLUMNS_LIST[columnIndex],
            -50,
            COL_GAP,
            COL_GAP,
            {
                frictionAir: fallSpeed,
                label: MUSIC_NOTE_LABEL,
                isSensor: true,
                render: {
                    fillStyle: color,
                },
            }
        );

        newMusicNote.plugin = { inputValue: input };
        Matter.World.add(this.engine.world, newMusicNote);
    }

    public getYDistanceBetweenTwoBodiesPosition(
        bodyAPosition: Matter.Vector,
        bodyBPosition: Matter.Vector
    ) {
        return Math.abs(bodyAPosition.y - bodyBPosition.y);
    }

    public destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);
        Matter.World.clear(this.engine.world, false);
        Matter.Engine.clear(this.engine);
    }
}
