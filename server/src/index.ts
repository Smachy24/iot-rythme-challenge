import { SerialPort } from "serialport";
import { XBeeParser, XBeeBuilder } from 'ts-xbee-api';
import { FRAME_TYPE, AT_COMMAND } from 'ts-xbee-api/src/lib/constants.js';
import dotenv from 'dotenv';
import client, { sendToTopic, subscribeToTopic } from "./mqtt-client.ts";
import { PlayerModel } from "./models/player.model.ts";


dotenv.config();

if (!process.env.SERIAL_PORT)
  throw new Error('Missing SERIAL_PORT environment variable');

if (!process.env.SERIAL_BAUDRATE)
  throw new Error('Missing SERIAL_BAUDRATE environment variable');

const TIMEOUT_MS = 6000;

// Initialize XBee API with API mode 2
const xbeeParser = new XBeeParser({
  api_mode: 2
});

const xbeeBuilder = new XBeeBuilder({
  api_mode: 2
});


// Track connected devices
const connectedDevices = new Map<string, PlayerModel>();

// Create serial port
const serialPort = new SerialPort({
  path: process.env.SERIAL_PORT,
  baudRate: parseInt(process.env.SERIAL_BAUDRATE || "9600"),
});

// Set up XBee API pipeline
serialPort.pipe(xbeeParser);
xbeeBuilder.pipe(serialPort);


function updateLight(atCommand: AT_COMMAND, on: boolean, destination64: string, destination16: string) {
  xbeeBuilder.write({
    type: FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: destination64,
    destination16: destination16,
    command: atCommand,
    commandParameter: [on ? 0x04 : 0x00],
  });
}

function createPlayer(deviceId: string, destinationController16: string): PlayerModel {
  const player = new PlayerModel(deviceId, destinationController16)
  connectedDevices.set(deviceId, player);
  subscribeToTopic(`game/${deviceId}/light`)
  subscribeToTopic(`game/${deviceId}/controller`)
  sendGamePlayersToTopic()
  return player
}

export function sendGamePlayersToTopic() {
  sendToTopic('game/players', `${JSON.stringify(connectedDevices.keys().toArray())}`);
}


// Set up serial port event handlers
serialPort.on("open", () => {
  console.log("Serial port opened");
});

serialPort.on("error", (error) => {
  console.error("Serial port error:", error);
});

serialPort.on("close", () => {
  console.log("Serial port closed");
});


client.on("message", (topic, message) => {
  const [game, deviceId, subTopic] = topic.split("/");

  const messageStr = message.toString();
  if (topic === "game/get-players" && messageStr === "players") {
    sendGamePlayersToTopic()
  }
  else if (subTopic === "light" && deviceId) {
    const player = connectedDevices.get(deviceId);
    if (player) {
      const lightArray: [boolean, boolean, boolean, boolean] = JSON.parse(messageStr);
      const lightIndex: number = lightArray.findIndex(value => value)
      const atCommand = player.lights[lightIndex] as AT_COMMAND;
      updateLight(atCommand, true, player.destinationController64, player.destinationController16);
    }

  }
});

// Set up XBee API event handlers
xbeeParser.on("data", (frame) => {
  const deviceId: string = frame.remote64.toString('hex');
  if (!connectedDevices.has(deviceId)) {
    createPlayer(deviceId, frame.remote16.toString('hex'));
  }
  if (frame.type === FRAME_TYPE.JOIN_NOTIFICATION_STATUS) {
    console.log("Join notification status");
  }
  if (frame.type === FRAME_TYPE.REGISTER_JOINING_DEVICE_STATUS) {
    console.log("Register joining device status");
  }
  if (frame.type === FRAME_TYPE.REGISTER_JOINING_DEVICE) {
    console.log("Register joining device");
  }
  if (frame.type === FRAME_TYPE.NODE_IDENTIFICATION) {
    console.log(connectedDevices);
  }

  if (frame.type === FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX) {
    const deviceId = frame.remote64.toString('hex');
    const digitalsSamples = frame.digitalSamples;

    const player = connectedDevices.get(deviceId);
    if (player) {
      player.lastRequestDate = Date.now();
      if (digitalsSamples.DIO0 === 1) {
        sendToTopic(`game/${player.destinationController64}/controller`, JSON.stringify([true, false, false, false]));
        updateLight(player.lights[0], false, player.destinationController64, player.destinationController16);
      }
      if (digitalsSamples.DIO1 === 1) {
        sendToTopic(`game/${player.destinationController64}/controller`, JSON.stringify([false, true, false, false]));
        updateLight(player.lights[1], false, player.destinationController64, player.destinationController16);
      }
      if (digitalsSamples.DIO2 === 1) {
        sendToTopic(`game/${player.destinationController64}/controller`, JSON.stringify([false, false, true, false]));
        updateLight(player.lights[2], false, player.destinationController64, player.destinationController16);
      }
      if (digitalsSamples.DIO3 === 1) {
        sendToTopic(`game/${player.destinationController64}/controller`, JSON.stringify([false, false, false, true]));
        updateLight(player.lights[3], false, player.destinationController64, player.destinationController16);
      }
    }
  }
});

// setInterval(() => {
//   const now = Date.now();
//   for (const [deviceId, player] of connectedDevices.entries()) {
//     if (now - player.lastRequestDate > TIMEOUT_MS) {
//       console.log(`Device ${deviceId} timed out`);
//       connectedDevices.delete(deviceId);
//       sendGamePlayersToTopic()
//     }
//   }
// }, TIMEOUT_MS);

