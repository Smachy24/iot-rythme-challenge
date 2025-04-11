import { PLAYERS_KEYBIND } from "../constants/gameConfig";
import type { GameEngine } from "./GameEngine";

export class InputManager {
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  public registerEvents() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const player = this.gameEngine.playerManager.findByMac(
      this.gameEngine["playerMac"]
    );
    if (!player) return;

    const keybinds = PLAYERS_KEYBIND[player.keybindId];
    if (!keybinds) {
      console.log(
        `Player ${player.mac} with keybind id ${player.keybindId} has no keybinds set`
      );
      return;
    }

    const foundKeybind = keybinds.find((k) => k.key === event.key);
    if (!foundKeybind) return;

    this.gameEngine.spawnerManager.handleInput(foundKeybind.column);
  };

  public destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}
