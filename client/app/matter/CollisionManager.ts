import Matter from "matter-js";
import events from "~/events/events";
import {
  GOOD_TIMING_BOX_LABEL,
  MUSIC_NOTE_LABEL,
} from "../constants/gameConfig";
import type { GameEngine } from "./GameEngine";

export class CollisionManager {
  private engine: Matter.Engine;
  private gameEngine: GameEngine;

  constructor(engine: Matter.Engine, gameEngine: GameEngine) {
    this.engine = engine;
    this.gameEngine = gameEngine;
  }

  public registerEvents() {
    Matter.Events.on(this.engine, "collisionStart", this.handleCollisionStart);
    Matter.Events.on(this.engine, "collisionEnd", this.handleCollisionEnd);
  }

  private handleCollisionStart = (
    event: Matter.IEventCollision<Matter.Engine>
  ) => {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      if (this.isMusicNoteAndTimingBoxCollision(bodyA, bodyB)) {
        const musicNote = this.getMusicNoteFromPair(bodyA, bodyB);
        if (musicNote) {
          events.emitLightOn(this.gameEngine.playerMac, musicNote.plugin.column);
          this.gameEngine.spawnerManager.addCollidingNote(musicNote);
        }
      }
    });
  };

  private handleCollisionEnd = (
    event: Matter.IEventCollision<Matter.Engine>
  ) => {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      if (
        bodyA.label === MUSIC_NOTE_LABEL ||
        bodyB.label === MUSIC_NOTE_LABEL
      ) {
        const musicNote = bodyA.label === MUSIC_NOTE_LABEL ? bodyA : bodyB;
        events.emitLightOff(this.gameEngine.playerMac, musicNote.plugin.column);
        this.gameEngine.spawnerManager.processEndCollision(musicNote);
      }
    });
  };

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

  private getMusicNoteFromPair(
    bodyA: Matter.Body,
    bodyB: Matter.Body
  ): Matter.Body | undefined {
    if (bodyA.label === MUSIC_NOTE_LABEL) return bodyA;
    if (bodyB.label === MUSIC_NOTE_LABEL) return bodyB;
    return undefined;
  }
}
