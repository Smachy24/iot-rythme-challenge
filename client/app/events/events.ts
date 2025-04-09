import { EventEmitter } from "stream";

const events = new EventEmitter();

export enum SendEvent {
  LightPlayer1 = "light_1",
  LightPlayer2 = "light_2"
}

export enum ReceiveEvent {
  InputPlayer1 = "input_1",
  InputPlayer2 = "input_2"
}

export default events;