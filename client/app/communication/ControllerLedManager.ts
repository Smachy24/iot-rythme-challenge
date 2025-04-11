type LedArray = [boolean, boolean, boolean, boolean];

class ControllerLedManager {
  public playerLedsState: Record<string, LedArray> = {};

  private getPlayerLedArray(playerMac: string) {
    return (
      this.playerLedsState[playerMac] ??
      (new Array<boolean>(4).fill(false) as LedArray)
    );
  }

  // Reset led array
  public GetResetLedActivationArray(playerMac: string) {
    this.playerLedsState[playerMac] = [false, false, false, false];
  }

  // Activate led array
  public GetActivateArray(playerMac: string, column: number) {
    // Get or initialize led array
    const lightArray = this.getPlayerLedArray(playerMac);

    // Set the correct led index
    if (0 <= column && column <= 3) {
      lightArray[column] = true;
    }

    // Update player's led state
    this.playerLedsState[playerMac] = lightArray;

    return lightArray;
  }

  // Desactivate led array
  public GetDesactivateArray(playerMac: string, column: number) {
    // Get or initialize led array
    const lightArray = this.getPlayerLedArray(playerMac);

    if (0 <= column && column <= 3) {
      lightArray[column] = false;
    }

    this.playerLedsState[playerMac] = lightArray;

    return lightArray;
  }
}

export const controllerLed = new ControllerLedManager();
