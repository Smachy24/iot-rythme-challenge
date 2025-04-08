import mqtt from "mqtt";

if (import.meta.env.VITE_WSS_URL == undefined) {
  throw new Error("No WSS_URL set in .env");
}

if (import.meta.env.VITE_WSS_PORT == undefined) {
  throw new Error("No WSS_PORT set in .env");
}

if (import.meta.env.VITE_WSS_PATH == undefined) {
  throw new Error("No WSS_PATH set in .env");
}

const client = mqtt.connect(import.meta.env.VITE_WSS_URL, {
  port: parseInt(import.meta.env.VITE_WSS_PORT),
  path: import.meta.env.VITE_WSS_PATH
});

client.on("connect", () => {
  client.subscribe("game/0013a20041a713b4")
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log(topic.toString(), message.toString());
});