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
import seedrandom from "seedrandom";

import { InputManager } from "./InputManager";
import { CollisionManager } from "./CollisionManager";
import { SpawnerManager } from "./SpawnerManager";
import { ScoreManager } from "./ScoreManager";

export class GameEngine {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;

  public inputManager: InputManager;
  public collisionManager: CollisionManager;
  public spawnerManager: SpawnerManager;
  public scoreManager: ScoreManager;

  public noteSound: HTMLAudioElement;
  private playerMac: string;
  public playerManager: PlayerManager;
  private musicNotePRNG: seedrandom.PRNG;
  private onScoreChange?: (score: number, label: ScoreLabel) => void;

  private goodTimingBoxPosition: Matter.Vector = { x: 0, y: 0 };
  public maxValidYPosition: number = COL_GAP;
  private constantFallSpeed: number = 5;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    playerMac: string,
    playerManager: PlayerManager,
    noteSound: HTMLAudioElement,
    musicNotePRNG: seedrandom.PRNG,
    onScoreChange?: (score: number, label: ScoreLabel) => void
  ) {
    this.playerMac = playerMac;
    this.playerManager = playerManager;
    this.noteSound = noteSound;
    this.onScoreChange = onScoreChange;
    this.musicNotePRNG = musicNotePRNG;

    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0;

    this.runner = Matter.Runner.create();

    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      canvas: canvas,
      options: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        wireframes: false,
        showAngleIndicator: true,
        background: COLORS.background,
      },
    });

    this.inputManager = new InputManager(this);
    this.collisionManager = new CollisionManager(this.engine, this);
    this.spawnerManager = new SpawnerManager(this.engine, this, musicNotePRNG);
    this.scoreManager = new ScoreManager(
      this.playerManager,
      this.playerMac,
      this.onScoreChange
    );

    this.init();
  }

  private init() {
    this.addGoodTimingBox();

    this.inputManager.registerEvents();
    this.collisionManager.registerEvents();

    Matter.Events.on(this.engine, "beforeUpdate", () => {
      this.updateNoteVelocities();
    });

    Matter.Runner.run(this.runner, this.engine);
    Matter.Render.run(this.render);
  }

  private addGoodTimingBox() {
    const goodTimingBox = this.createGoodTimingBox();
    this.goodTimingBoxPosition = goodTimingBox.position;
    Matter.World.add(this.engine.world, goodTimingBox);
  }

  private createGoodTimingBox(): Matter.Body {
    return Matter.Bodies.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT - 50,
      WORLD_WIDTH,
      100,
      {
        isStatic: true,
        isSensor: true,
        label: GOOD_TIMING_BOX_LABEL,
        render: {
          fillStyle: "white",
          opacity: 0.2,
        },
      }
    );
  }

  private updateNoteVelocities() {
    this.engine.world.bodies.forEach((body) => {
      if (body.label === MUSIC_NOTE_LABEL) {
        Matter.Body.setVelocity(body, {
          x: 0,
          y: this.constantFallSpeed,
        });
      }
    });
  }

  public getGoodTimingBoxPosition(): Matter.Vector {
    return this.goodTimingBoxPosition;
  }

  public spawnMusicNote() {
    this.spawnerManager.spawnMusicNote();
  }

  public destroy() {
    this.inputManager.destroy();
    Matter.Render.stop(this.render);
    Matter.Runner.stop(this.runner);
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }
}
