import events, { GameEvent, ReceiveEvent, RythmEvents } from "~/events/events";

interface IPlayer {
  mac: string
  score: number
  keybindId: number
}

export class PlayerManager {
  public players: IPlayer[] = [];

  constructor(events: RythmEvents) {
    // Player connect
    events.on(ReceiveEvent.Connect, (mac) => { this.addPlayer(mac); });
    
    // Player disconnect
   events.on(ReceiveEvent.Disconnect, (mac) => { this.removePlayer(mac); });
    
    // Player score update
   events.on(GameEvent.UpdateScore, (mac, amount) => { this.updateScore(mac, amount); });
  }
  
  public findByMac(mac: string) {
    return this.players.find(p => p.mac === mac);
  }
  public findIndexByMac(mac: string) {
    return this.players.findIndex(p => p.mac === mac);
  }
  public addPlayer(mac: string) {
    console.log(`player connect ${mac}`);
    this.players.push({
      mac,
      score: 0,
      keybindId: this.players.length
    });
  }
  public removePlayer(mac: string) {
    console.log(`player disconnect ${mac}`)
    const foundIndex = this.findIndexByMac(mac);
    if (foundIndex === -1) return;  
    this.players.splice(foundIndex, 1);
  }
  public updateScore(mac: string, amount: number) {
    console.log(`player score updated ${mac} with ${amount}`)
    const player = this.findByMac(mac);
    if (player === undefined) return;
    player.score += amount;
  }
}

export const playerManager = new PlayerManager(events);