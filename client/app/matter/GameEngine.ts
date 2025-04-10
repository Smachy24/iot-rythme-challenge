import Matter from "matter-js";
import events, { ReceiveEvent } from "~/events/events";
import {
  COL_GAP,
  COLUMNS_LIST,
  GOOD_TIMING_BOX_LABEL,
  MUSIC_NOTE_COLORS,
  MUSIC_NOTE_LABEL,
  NUMBER_OF_COL,
  PLAYERS_KEYBIND,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants/gameConfig";
import { COLORS } from "../theme/colors";
import { getScore, SCORE_MAPPING, type ScoreLabel } from "./utils/score";
import type { PlayerManager } from "./PlayerManager";

export class GameEngine {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;
  // Active music notes are the music notes that are currently in the world and colliding with the good timing box
  private musicNotesCollidingWithTimingBox: Set<Matter.Body> = new Set();
  // Pressed music note are the music note that are currently colliding with the floor and have been pressed
  private pressedMusicNotesCollidingWithTimingBox: Set<Matter.Body> = new Set();

  private noteSound: HTMLAudioElement;
  private goodTimingBoxPosition: Matter.Vector = { x: 0, y: 0 };
  private maxValidYPosition: number = COL_GAP;
  private onScoreChange?: (score: number, label: ScoreLabel) => void;
  private playerMac: string;
  private playerManager: PlayerManager;
  private constantFallSpeed: number = 5;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    playerMac: string,
    playerManager: PlayerManager,
    noteSound: HTMLAudioElement,
    onScoreChange?: (score: number, label: ScoreLabel) => void
  ) {
    // The engine is used to create the physics world
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0;
    // The runner is used to run the engine
    this.runner = Matter.Runner.create();
    // The render is used to create the canvas
    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      canvas: canvas,
      options: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        wireframes: false, // Enable wireframes for debugging
        showAngleIndicator: true,
        background: COLORS.background,
      },
    });
    this.goodTimingBoxPosition = { x: 0, y: 0 };
    this.maxValidYPosition = COL_GAP;
    this.playerMac = playerMac;
    this.playerManager = playerManager;
    this.noteSound = noteSound;
    this.onScoreChange = onScoreChange;
    this.init();
  }

  private init() {
    this.addGoodTimingBox();
    this.registerEvents();

    Matter.Events.on(this.engine, "beforeUpdate", () => {
      this.engine.world.bodies.forEach((body) => {
        if (body.label === MUSIC_NOTE_LABEL) {
          Matter.Body.setVelocity(body, {
            x: 0,
            y: this.constantFallSpeed,
          });
        }
      });
    });
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

    // Receive inputs from broker, checks if it's correct mac and handles input
    events.on(
      ReceiveEvent.Input,
      (mac, column) => mac == this.playerMac && this.handleInput(column)
    );

    // Handle collision events
    Matter.Events.on(this.engine, "collisionStart", this.handleCollisionStart);
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
        const musicNote = bodyA.label === MUSIC_NOTE_LABEL ? bodyA : bodyB;
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
    const player = this.playerManager.findByMac(this.playerMac);
    if (player == undefined) return;

    const keybinds = PLAYERS_KEYBIND[player.keybindId];

    if (keybinds == undefined) {
      console.log(
        `player ${player.mac} with keybind id of ${player.keybindId} has no keybinds set`
      );
      return;
    }

    const foundKeybind = keybinds.find((k) => k.key == event.key);

    if (foundKeybind == undefined) return;
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
    this.playerManager.updateScore(this.playerMac, score);
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
        label: MUSIC_NOTE_LABEL,
        isSensor: true,
        render: {
          fillStyle: color,
        },
        velocity: {
          x: 0,
          y: 0.5,
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
