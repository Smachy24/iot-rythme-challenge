import { AT_COMMAND } from "ts-xbee-api/src/lib/constants.js";

export class PlayerModel {
  private _username: string;
  private _destinationController64: string;
  private _destinationController16: string;
  private _controllerNodeIdentifier: string
  private _buttons: AT_COMMAND[];
  private _lights: AT_COMMAND[];

  constructor(username: string, destinationController64: string, destinationController16: string, controllerNodeIdentifier: string) {
    this._username = username;
    this._destinationController64 = destinationController64;
    this._destinationController16 = destinationController16;
    this._controllerNodeIdentifier = controllerNodeIdentifier;
    this._buttons = [AT_COMMAND.D0, AT_COMMAND.D1, AT_COMMAND.D2, AT_COMMAND.D3];
    this._lights = [AT_COMMAND.D4, AT_COMMAND.D5, AT_COMMAND.D6, AT_COMMAND.D7];
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }


  get destinationController64(): string {
    return this._destinationController64;
  }

  set destinationController64(value: string) {
    this._destinationController64 = value;
  }

  get destinationController16(): string {
    return this._destinationController16;
  }

  set destinationController16(value: string) {
    this._destinationController16 = value;
  }

  get controllerNodeIdentifier(): string {
    return this._controllerNodeIdentifier;
  }

  set controllerNodeIdentifier(value: string) {
    this._controllerNodeIdentifier = value;
  }

  get buttons(): AT_COMMAND[] {
    return this._buttons;
  }

  set buttons(value: AT_COMMAND[]) {
    this._buttons = value;
  }

  get lights(): AT_COMMAND[] {
    return this._lights;
  }

  set lights(value: AT_COMMAND[]) {
    this._lights = value;
  }



}
