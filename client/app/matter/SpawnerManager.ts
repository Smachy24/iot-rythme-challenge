import Matter from "matter-js";
import {
  COL_GAP,
  COLUMNS_LIST,
  MUSIC_NOTE_COLORS,
  NUMBER_OF_COL,
  MUSIC_NOTE_LABEL,
} from "../constants/gameConfig";
import { getScore, SCORE_MAPPING, type ScoreLabel } from "./utils/score";
import type { GameEngine } from "./GameEngine";
import type seedrandom from "seedrandom";

export class SpawnerManager {
  private engine: Matter.Engine;
  private gameEngine: GameEngine;

  private musicNotesCollidingWithTimingBox: Set<Matter.Body> = new Set();
  private pressedMusicNotesCollidingWithTimingBox: Set<Matter.Body> = new Set();

  private pnrg: seedrandom.PRNG;

  constructor(
    engine: Matter.Engine,
    gameEngine: GameEngine,
    pnrg: seedrandom.PRNG
  ) {
    this.engine = engine;
    this.gameEngine = gameEngine;
    this.pnrg = pnrg;
  }

  public spawnMusicNote() {
    const columnIndex = Math.floor(this.pnrg() * NUMBER_OF_COL);
    const { color } = MUSIC_NOTE_COLORS[columnIndex];
    const note = Matter.Bodies.rectangle(
      COLUMNS_LIST[columnIndex],
      -50,
      COL_GAP,
      COL_GAP,
      {
        label: MUSIC_NOTE_LABEL,
        isSensor: true,
        render: { fillStyle: color },
        velocity: { x: 0, y: 0.5 },
      }
    );
    note.plugin = { column: columnIndex };
    Matter.World.add(this.engine.world, note);
  }

  public handleInput(column: number) {
    const matchingNotes = Array.from(
      this.musicNotesCollidingWithTimingBox
    ).filter((musicNote) => musicNote.plugin?.column === column);

    if (matchingNotes.length === 0) {
      this.processInputMiss();
      return;
    }

    const noteToRemove = this.getClosestNote(matchingNotes);
    this.processNoteHit(noteToRemove);
  }

  public addCollidingNote(note: Matter.Body) {
    this.musicNotesCollidingWithTimingBox.add(note);
  }

  public processEndCollision(note: Matter.Body) {
    if (
      this.musicNotesCollidingWithTimingBox.has(note) &&
      !this.pressedMusicNotesCollidingWithTimingBox.has(note)
    ) {
      const { score, label } = SCORE_MAPPING.miss;
      this.gameEngine.scoreManager.updateScore(score, label);
      this.addFeedbackClass(label);
      console.log("You missed the note");
    }
    this.pressedMusicNotesCollidingWithTimingBox.delete(note);
    this.musicNotesCollidingWithTimingBox.delete(note);
  }

  private processInputMiss() {
    if (this.musicNotesCollidingWithTimingBox.size === 0) {
      const { score, label } = SCORE_MAPPING.too_early;
      this.gameEngine.scoreManager.updateScore(score, label);
    } else {
      const { score, label } = SCORE_MAPPING.wrong_note;
      this.gameEngine.scoreManager.updateScore(score, label);
    }
  }

  private getClosestNote(notes: Matter.Body[]): Matter.Body {
    const goodTimingBoxY = this.gameEngine.getGoodTimingBoxPosition().y;
    let selectedNote = notes[0];
    let minDistance = Math.abs(selectedNote.position.y - goodTimingBoxY);
    for (const note of notes) {
      const distance = Math.abs(note.position.y - goodTimingBoxY);
      if (distance < minDistance) {
        minDistance = distance;
        selectedNote = note;
      }
    }
    return selectedNote;
  }

  private processNoteHit(note: Matter.Body) {
    this.pressedMusicNotesCollidingWithTimingBox.add(note);
    const goodTimingBoxPosition = this.gameEngine.getGoodTimingBoxPosition();
    const yPositionFromGoodLimit = Math.abs(
      note.position.y - goodTimingBoxPosition.y
    );
    const { score, label } = getScore(
      yPositionFromGoodLimit,
      this.gameEngine.maxValidYPosition
    );
    this.gameEngine.scoreManager.updateScore(score, label);
    this.gameEngine.noteSound.play();
    this.addFeedbackClass(label);
    console.log(label);
    Matter.World.remove(this.engine.world, note);
    this.musicNotesCollidingWithTimingBox.delete(note);
  }

  private addFeedbackClass(label: ScoreLabel) {
    const canvasRef = this.gameEngine.getCanvasRef();
    canvasRef.classList.add(`${label}-feedback`);
    setTimeout(() => {
      canvasRef.classList.remove(`${label}-feedback`);
    }, 200);
  }
}
