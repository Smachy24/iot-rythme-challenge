import console from "console";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { controller, gameTopic, light, path, player1, player2, port, url } from "~/config/config";
import { PLAYERS } from "~/constants/gameConfig";
import events, { ReceiveEvent, SendEvent } from "~/events/events";

// Send light info
function sendLightOn(client: mqtt.MqttClient, playerId: number, column: number) {
  const lightArray = new Array(4).fill(false);
  lightArray[column] = true;
  const playerTopic = playerId == 1 ? player1 : player2;
  client.publish(`${gameTopic}/${playerTopic}/${light}`, JSON.stringify(lightArray), resp => console.log("cb", resp));
}

export const Mqtt = (): React.JSX.Element => {
  const [client, setClient] = useState<mqtt.MqttClient>();
  const [connectStatus, setConnectStatus] = useState("");

  useEffect(() => {
    if (client) {
      // console.log(client);
      client.on('connect', () => {
        setConnectStatus('Connected');

        // Subscribe to controllers
        client.subscribe(`${gameTopic}/${player1}/${controller}`);
        client.subscribe(`${gameTopic}/${player2}/${controller}`);

        events.on(SendEvent.LightPlayer1, (column: number) => {
          sendLightOn(client, 1, column);
        }) 

        events.on(SendEvent.LightPlayer2, (column: number) => {
          sendLightOn(client, 2, column)
        })
      });

      client.on('error', (err) => {
        // console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });

      client.on('message', (topic, message) => {
        // Get column
        const buttonId = parseInt(message.toString().slice("Button ".length));
        const playerId = topic.includes(`${gameTopic}/${player1}`) ? PLAYERS.ONE : PLAYERS.TWO

        switch (playerId) {
          case PLAYERS.ONE: events.emit(ReceiveEvent.InputPlayer1, buttonId); break;
          case PLAYERS.TWO: events.emit(ReceiveEvent.InputPlayer2, buttonId); break;
        }

        // console.log(topic + " " + message.toString());
      });
    } else {
      setConnectStatus('Connecting');
      setClient(mqtt.connect(url, { port, path }));
    }
  }, [client]);

  return <></>
}