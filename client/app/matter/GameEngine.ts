import Matter from "matter-js";
import events, { ReceiveEvent } from "~/events/events";
import {
    COL_GAP,
    COLUMNS_LIST,
    GOOD_TIMING_BOX_LABEL,
    MUSIC_NOTE_COLORS,
    MUSIC_NOTE_LABEL,
    NUMBER_OF_COL,
    PLAYERS,
    PLAYERS_KEYBIND,
    WORLD_HEIGHT,
    WORLD_WIDTH,
} from "../constants/gameConfig";
import { COLORS } from "../theme/colors";
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

    private noteSound: HTMLAudioElement;
    private goodTimingBoxPosition: Matter.Vector = { x: 0, y: 0 };
    private maxValidYPosition: number = COL_GAP;
    private onScoreChange?: (score: number, label: ScoreLabel) => void;
    private playerId: PLAYERS;

    constructor(
        container: HTMLElement,
        canvas: HTMLCanvasElement,
        playerId: PLAYERS,
        noteSound: HTMLAudioElement,
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
                showAngleIndicator: true,
                background: backgroundColor,
            },
        });
        this.playerId = playerId;
        this.noteSound = noteSound;
        this.onScoreChange = onScoreChange;
        this.init();
    }

    private init() {
        this.addGoodTimingBox();
        this.registerEvents();
        Matter.Runner.run(this.runner, this.engine);
        Matter.Render.run(this.render);
    }

    /**
     * Add the good timing box to the world
     */
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

    /**
     * Register all events: keyboard events, player input events, and collision events
     */
    private registerEvents() {
        window.addEventListener("keydown", this.handleKeyDown);

        // Receive inputs from broker, separeted for player 1 & 2
        events.removeListener(ReceiveEvent.InputPlayer1);
        events.removeListener(ReceiveEvent.InputPlayer2);

        switch (this.playerId) {
            case PLAYERS.ONE:
                events.on(ReceiveEvent.InputPlayer1, this.handleInput);
                break;
            case PLAYERS.TWO:
                events.on(ReceiveEvent.InputPlayer2, this.handleInput);
                break;
        }

        // Handle collision events
        Matter.Events.on(
            this.engine,
            "collisionStart",
            this.handleCollisionStart
        );
        Matter.Events.on(this.engine, "collisionEnd", this.handleCollisionEnd);
    }

    /**
     * Handle collision start events
     * Event contains the elements that are colliding
     * We need to use forEach because event.pairs is an array that contains the elements that are colliding
     */
    private handleCollisionStart = (
        event: Matter.IEventCollision<Matter.Engine>
    ) => {
        event.pairs.forEach(({ bodyA, bodyB }) => {
            // We just have to check if the bodyA or bodyB is the ball because the ball is the only element that can collide with the floor
            if (this.isMusicNoteAndTimingBoxCollision(bodyA, bodyB)) {
                const musicNote = this.getMusicNoteFromPair(bodyA, bodyB);
                if (musicNote) {
                    this.musicNotesCollidingWithTimingBox.add(musicNote);
                }
            }
        });
    };

    /**
     * Handle collision end events
     * Checks if the music note was pressed or not and updates the score accordingly
     */
    private handleCollisionEnd = (
        event: Matter.IEventCollision<Matter.Engine>
    ) => {
        event.pairs.forEach(({ bodyA, bodyB }) => {
            if (
                bodyA.label === MUSIC_NOTE_LABEL ||
                bodyB.label === MUSIC_NOTE_LABEL
            ) {
                const musicNote =
                    bodyA.label === MUSIC_NOTE_LABEL ? bodyA : bodyB;
                if (
                    this.musicNotesCollidingWithTimingBox.has(musicNote) &&
                    !this.pressedMusicNotesCollidingWithTimingBox.has(musicNote)
                ) {
                    const { score, label } = SCORE_MAPPING.miss;
                    this.updateScore(score, label);
                    console.log("You missed the note");
                }
                this.pressedMusicNotesCollidingWithTimingBox.delete(musicNote);
                this.musicNotesCollidingWithTimingBox.delete(musicNote);
            }
        });
    };

    /**
     * Check if one of the bodies is a music note and the other is the good timing box
     */
    private isMusicNoteAndTimingBoxCollision(
        bodyA: Matter.Body,
        bodyB: Matter.Body
    ): boolean {
        return (
            (bodyA.label === MUSIC_NOTE_LABEL &&
                bodyB.label === GOOD_TIMING_BOX_LABEL) ||
            (bodyB.label === MUSIC_NOTE_LABEL &&
                bodyA.label === GOOD_TIMING_BOX_LABEL)
        );
    }

    /**
     * Extract the music note body from the collision pair
     */
    private getMusicNoteFromPair(
        bodyA: Matter.Body,
        bodyB: Matter.Body
    ): Matter.Body | undefined {
        return bodyA.label === MUSIC_NOTE_LABEL
            ? bodyA
            : bodyB.label === MUSIC_NOTE_LABEL
            ? bodyB
            : undefined;
    }

    /**
     * Keydown event handler
     * Checks the player's keybinds and calls handleInput if a valid key is pressed
     */
    private handleKeyDown = (event: KeyboardEvent) => {
        const keybinds = PLAYERS_KEYBIND[this.playerId];
        const foundKeybind = keybinds.find((k) => k.key === event.key);
        if (!foundKeybind) return;
        this.handleInput(foundKeybind.column);
    };

    /**
     * Process player input (via keyboard or custom event) by verifying if a music note is colliding
     * in the correct column
     */
    private handleInput = (column: number) => {
        if (this.musicNotesCollidingWithTimingBox.size === 0) {
            const { score, label } = SCORE_MAPPING.too_early;
            this.updateScore(score, label);
            return;
        }

        this.musicNotesCollidingWithTimingBox.forEach((musicNote) => {
            if (column === musicNote.plugin.column) {
                this.pressedMusicNotesCollidingWithTimingBox.add(musicNote);
                const yPositionFromGoodLimit =
                    this.getYDistanceBetweenTwoBodiesPosition(
                        musicNote.position,
                        this.goodTimingBoxPosition
                    );
                const { score, label } = getScore(
                    yPositionFromGoodLimit,
                    this.maxValidYPosition
                );
                this.updateScore(score, label);
                this.noteSound.play();
                console.log(label);
                Matter.World.remove(this.engine.world, musicNote);
            } else {
                const { score, label } = SCORE_MAPPING.wrong_note;
                this.updateScore(score, label);
            }
        });
    };

    /**
     * Update the score using the callback provided in the constructor
     */
    private updateScore(score: number, label: ScoreLabel) {
        this.onScoreChange?.(score, label);
    }

    /**
     * Create and add a new music note to the world
     */
    public spawnMusicNote(fallSpeed: number = 0.05) {
        const columnIndex = Math.floor(Math.random() * NUMBER_OF_COL);
        const { color } = MUSIC_NOTE_COLORS[columnIndex];

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

        newMusicNote.plugin = { column: columnIndex };
        Matter.World.add(this.engine.world, newMusicNote);
    }

    /**
     * Compute the vertical distance between two positions
     */
    public getYDistanceBetweenTwoBodiesPosition(
        bodyAPosition: Matter.Vector,
        bodyBPosition: Matter.Vector
    ): number {
        return Math.abs(bodyAPosition.y - bodyBPosition.y);
    }

    /**
     * Clean up and destroy Matter.js components and event listeners
     */
    public destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);
        Matter.World.clear(this.engine.world, false);
        Matter.Engine.clear(this.engine);
    }
}
