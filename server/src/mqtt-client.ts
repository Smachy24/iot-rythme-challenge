import mqtt from "mqtt";
import { sendGamePlayersToTopic } from "./index.ts";

const client = mqtt.connect("mqtt://test.mosquitto.org");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  sendGamePlayersToTopic();
});

export function subscribeToTopic(topic: string) {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic ${topic}:`, err);
    }
    else {
      console.log(`Subscribed to topic ${topic}`);
    }
  });
}

export function sendToTopic(topic: string, message: string) {
  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`Failed to publish message to topic ${topic}:`, err);
    }
    else {
      console.log(`Published message to topic ${topic}`);
    }
  });
}

export default client;
