import EventEmitter from "eventemitter3";

/**
 * Client to server
 */
export enum SendEvent {
  ActivateLight = "activate_light",
  DesactivateLight = "desativate_light",
  ResetLights = "reset_lights",
}

/**
 * Server to client
 */
export enum ReceiveEvent {
  Connect = "player_connect",
  Disconnect = "player_disconnect",
  Input = "player_input",
}

/**
 * Game events, client to client
 */
export enum GameEvent {
  UpdateScore = "player_score_update",
}

/**
 * Used for proper listener parameter definitions
 */
export declare interface RythmEvents {
  on(event: ReceiveEvent.Connect, listener: (addedMac: string) => void): this;
  on(
    event: ReceiveEvent.Disconnect,
    listener: (removedMac: string) => void
  ): this;
  on(
    event: ReceiveEvent.Input,
    listener: (playerMac: string, column: number) => void
  ): this;
  on(
    event: SendEvent.ActivateLight,
    listener: (playerMac: string, column: number) => void
  ): this;
  on(
    event: SendEvent.DesactivateLight,
    listener: (playerMac: string, column: number) => void
  ): this;
  on(event: SendEvent.ResetLights, listener: (playerMac: string) => void): this;
  on(
    event: GameEvent.UpdateScore,
    listener: (playerMac: string, amount: number) => void
  ): this;
  on(event: "log", listener: (...args: any[]) => void): this;
}

export class RythmEvents extends EventEmitter {
  emitConnect(mac: string): void {
    this.emit(ReceiveEvent.Connect, mac);
  }
  emitDisconnect(mac: string): void {
    this.emit(ReceiveEvent.Disconnect, mac);
  }
  emitInput(mac: string, column: number): void {
    this.emit(ReceiveEvent.Input, mac, column);
  }
  emitLightOn(mac: string, column: number): void {
    this.emit(SendEvent.ActivateLight, mac, column);
  }
  emitLightOff(mac: string, column: number): void {
    this.emit(SendEvent.DesactivateLight, mac, column);
  }
  emitLightReset(mac: string): void {
    this.emit(SendEvent.ResetLights, mac);
  }
}

const events = new RythmEvents();

events.on("log", (...args: any[]) => {
  console.log(...args);
});

export default events;
