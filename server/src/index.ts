import { SerialPort } from "serialport";
import { XBeeParser, XBeeBuilder, type BuildableFrame } from 'ts-xbee-api';
import { FRAME_TYPE, AT_COMMAND } from 'ts-xbee-api/src/lib/constants.js';
import dotenv from 'dotenv';
import client, { sendToTopic, subscribeToTopic } from "./mqtt-client.ts";
import { PlayerModel } from "./models/player.model.ts";


dotenv.config();

if (!process.env.SERIAL_PORT)
    throw new Error('Missing SERIAL_PORT environment variable');

if (!process.env.SERIAL_BAUDRATE)
    throw new Error('Missing SERIAL_BAUDRATE environment variable');





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
    commandParameter: [on ? 0x05 : 0x00],
  });
}


function getPlayerByUsername(username: string): PlayerModel | undefined {
  return Array.from(connectedDevices.values()).find(
    (player) => player.username === username
  );
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
  const [ game, username, subTopic ] = topic.split("/");

  if(subTopic === "light" && username) {
    console.log(message.toString());
    const player = getPlayerByUsername(username);
    if(player) {
      const lightArray: [boolean, boolean, boolean, boolean] = JSON.parse(message.toString());
      const lightIndex: number = lightArray.findIndex(value => value)
      const atCommand = player.lights[lightIndex] as AT_COMMAND;
      updateLight(atCommand, true, player.destinationController64, player.destinationController16);
    }

  }
});

// Set up XBee API event handlers
xbeeParser.on("data", (frame) => {
  if(frame.type === FRAME_TYPE.JOIN_NOTIFICATION_STATUS) {
    console.log("Join notification status");
  }
  if(frame.type === FRAME_TYPE.REGISTER_JOINING_DEVICE_STATUS) {
    console.log("Register joining device status");
  }
  if(frame.type === FRAME_TYPE.REGISTER_JOINING_DEVICE) {
    console.log("Register joining device");
  }
  if (frame.type === FRAME_TYPE.NODE_IDENTIFICATION) {
    const deviceId: string = frame.sender64.toString('hex');
    const nodeIdentifier = frame.nodeIdentifier;

    if (!connectedDevices.has(deviceId)) {
      const username = "player" + (connectedDevices.size + 1);
      const player = new PlayerModel(username, deviceId, frame.sender16.toString('hex'), nodeIdentifier)
      connectedDevices.set(deviceId, player);
      console.log(`Device ${deviceId} joined the network`);
      subscribeToTopic(`game/${username}/light`)
      subscribeToTopic(`game/${username}/controller`)
    }
    console.log(connectedDevices);
  }

  if(frame.type === FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX) {
    const deviceId = frame.remote64.toString('hex');
    const digitalsSamples = frame.digitalSamples;
    const player = connectedDevices.get(deviceId);
    if(player){
      if(digitalsSamples.DIO0 === 1) {
        sendToTopic(`game/${player.username}/controller`, [true, false, false, false].toString());
      }
      if(digitalsSamples.DIO1 === 1) {
        sendToTopic(`game/${player.username}/controller`, [false, true, false, false].toString());
      }
      if(digitalsSamples.DIO2 === 1) {
        sendToTopic(`game/${player.username}/controller`, [false, false, true, false].toString());
      }
      if(digitalsSamples.DIO3 === 1) {
        sendToTopic(`game/${player.username}/controller`, [false, false, false, true].toString());
      }
    }

  }


});

