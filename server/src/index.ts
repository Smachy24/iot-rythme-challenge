import { SerialPort } from "serialport";
import { XBeeParser, XBeeBuilder, type BuildableFrame } from 'ts-xbee-api';
import { FRAME_TYPE, AT_COMMAND } from 'ts-xbee-api/src/lib/constants.js';
import dotenv from 'dotenv';

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
const connectedDevices = new Set<string>();

// Create serial port
const serialPort = new SerialPort({
  path: process.env.SERIAL_PORT,
  baudRate: parseInt(process.env.SERIAL_BAUDRATE || "9600"),
});

// Set up XBee API pipeline
serialPort.pipe(xbeeParser);
xbeeBuilder.pipe(serialPort);

import { sendToTopic, subscribeToTopic } from "./mqtt-client.ts";


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
    const deviceId = frame.sender64.toString('hex');
      console.log(deviceId);
    if (!connectedDevices.has(deviceId)) {
      connectedDevices.add(deviceId);
      console.log(`Device ${deviceId} joined the network`);
      subscribeToTopic(`game/${deviceId}`)
    }
  }
  if(frame.type === FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX) {
    console.log(frame)
    const deviceId = frame.remote64.toString('hex');
    const digitalsSamples = frame.digitalSamples;
    if(digitalsSamples.DIO0 === 1) {
      sendToTopic(`game/${deviceId}`, "Bouton 0");
      xbeeBuilder.write({
        type: FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
        destination64: frame.remote64,
        destination16: frame.remote16,
        command: AT_COMMAND.D2,
        commandParameter: [0x05],
      })
    }

    if(digitalsSamples.DIO1 === 1) {
      sendToTopic(`game/${deviceId}`, "Bouton 1");
    }
  }

  console.log(connectedDevices);
});

