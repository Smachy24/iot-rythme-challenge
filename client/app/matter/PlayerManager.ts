import events, { GameEvent, ReceiveEvent, RythmEvents } from "~/events/events";
import { playersMock } from "~/mock/playersMock";

export interface IPlayer {
  mac: string;
  score: number;
  keybindId: number;
}

type PlayerUpdateCallback = (players: IPlayer[]) => void;

export class PlayerManager {
  // public players: IPlayer[] = playersMock;
  public players: IPlayer[] = [];
  private onUpdate?: PlayerUpdateCallback;

  constructor(events: RythmEvents, onUpdate?: PlayerUpdateCallback) {
    this.onUpdate = onUpdate;
    // Player connect
    events.on(ReceiveEvent.Connect, (mac) => {
      this.addPlayer(mac);
    });

    // Player disconnect
    events.on(ReceiveEvent.Disconnect, (mac) => {
      this.removePlayer(mac);
    });

    // Player score update
    events.on(GameEvent.UpdateScore, (mac, amount) => {
      this.updateScore(mac, amount);
    });
  }

  // We need to create a notify function to use React reactivity feature later
  private notify() {
    this.onUpdate?.([...this.players]);
  }

  public findByMac(mac: string) {
    return this.players.find((p) => p.mac === mac);
  }
  public findIndexByMac(mac: string) {
    return this.players.findIndex((p) => p.mac === mac);
  }
  public addPlayer(mac: string) {
    console.log(`player connect ${mac}`);
    this.players.push({
      mac,
      score: 0,
      keybindId: this.players.length,
    });
    this.notify();
  }
  public removePlayer(mac: string) {
    console.log(`player disconnect ${mac}`);
    const foundIndex = this.findIndexByMac(mac);
    if (foundIndex === -1) return;
    this.players.splice(foundIndex, 1);
    this.notify();
  }
  public updateScore(mac: string, amount: number) {
    console.log(`player score updated ${mac} with ${amount}`);
    const player = this.findByMac(mac);
    if (player === undefined) return;
    player.score += amount;
    this.notify();
  }

  public setOnUpdate(callback: PlayerUpdateCallback) {
    this.onUpdate = callback;
    this.notify();
  }

  public resetScores() {
    console.log("resetting scores");

    this.players.forEach((p) => {
      p.score = 0;
    });
    this.notify();
  }
}

export const playerManager = new PlayerManager(events);
