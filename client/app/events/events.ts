import EventEmitter from "eventemitter3";

/**
 * Client to server
 */
export enum SendEvent {
  Light = "light",
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
  on(event: ReceiveEvent.Disconnect, listener: (removedMac: string) => void): this;
  on(event: ReceiveEvent.Input, listener: (playerMac: string, column: number) => void): this;
  on(event: SendEvent.Light, listener: (playerMac: string, column: number) => void): this;
  on(event: GameEvent.UpdateScore, listener: (playerMac: string, amount: number)=> void): this;
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
  emitLight(mac: string, column: number): void {
    this.emit(SendEvent.Light, mac, column);
  }
}

const events = new RythmEvents();

events.on("log", (...args: any[]) => {
  console.log(...args);
})

export default events;