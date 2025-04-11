import type { ScoreLabel } from "./utils/score";
import type { PlayerManager } from "./PlayerManager";

export class ScoreManager {
  private playerManager: PlayerManager;
  private playerMac: string;
  private onScoreChange?: (score: number, label: ScoreLabel) => void;

  constructor(
    playerManager: PlayerManager,
    playerMac: string,
    onScoreChange?: (score: number, label: ScoreLabel) => void
  ) {
    this.playerManager = playerManager;
    this.playerMac = playerMac;
    this.onScoreChange = onScoreChange;
  }

  public updateScore(score: number, label: ScoreLabel) {
    this.playerManager.updateScore(this.playerMac, score);
    if (this.onScoreChange) {
      this.onScoreChange(score, label);
    }
  }
}
