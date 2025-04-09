import { AT_COMMAND } from "ts-xbee-api/src/lib/constants.js";

export class PlayerModel {
  private _destinationController64: string;
  private _destinationController16: string;
  private _controllerNodeIdentifier: string
  private _lights: AT_COMMAND[];
  public lastRequestDate: number;


  constructor(destinationController64: string, destinationController16: string, controllerNodeIdentifier: string) {
    this._destinationController64 = destinationController64;
    this._destinationController16 = destinationController16;
    this._controllerNodeIdentifier = controllerNodeIdentifier;
    this._lights = [AT_COMMAND.D4, AT_COMMAND.D5, AT_COMMAND.D6, AT_COMMAND.D7];
    this.lastRequestDate = Date.now();

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

  get lights(): AT_COMMAND[] {
    return this._lights;
  }

  set lights(value: AT_COMMAND[]) {
    this._lights = value;
  }



}
