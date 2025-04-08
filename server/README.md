# XBee API Platform

A TypeScript-based platform for controlling XBee modules using the Serial API mode 2.

## Features

- Serial communication using API mode 2
- Environment variable configuration for serial port settings

## Prerequisites

- Node.js and npm installed
- XBee module configured in API mode 2

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
SERIAL_PORT=/dev/tty.usbserial-XXXXX  # Your XBee serial port
SERIAL_BAUDRATE=9600                   # XBee baud rate
```

## Usage

Start the application:

```bash
npm start
```

Development mode with auto-reload:

```bash
npm run dev
```

## Dependencies

- serialport: Serial communication
- ts-xbee-api: XBee API frame parsing and building
- dotenv: Environment configuration
- socket.io: WebSocket communication (not used yet, prepared for future features)

## License

Private - All rights reserved
