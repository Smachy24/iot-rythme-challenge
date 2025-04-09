import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { controller, gameTopic, light, path, player1, player2, port, url } from "~/config/config";

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
      console.log(client);
      client.on('connect', () => {
        setConnectStatus('Connected');

        // Subscribe to controllers
        client.subscribe(`${gameTopic}/${player1}/${controller}`);
        client.subscribe(`${gameTopic}/${player2}/${controller}`);
        
        // client.subscribe(`${gameTopic}/${light1}`)
        // client.subscribe(`${gameTopic}/${light2}`)
      });

      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });

      client.on('message', (topic, message) => {
        const noGameTopic = topic.slice(`${gameTopic}/`.length);

        // Get column
        const buttonId = message.toString().slice("Button ".length);
        const player = topic.includes(`${gameTopic}/${player1}`) ? 1 : 2;
        
        console.log(player, buttonId)
        console.log(topic + " " + message.toString());
      });
    } else {
      setConnectStatus('Connecting');
      setClient(mqtt.connect(url, { port, path }));
    }
  }, [client]);

  return <></>
}