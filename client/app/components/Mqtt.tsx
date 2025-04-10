import console from "console";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { controller, gameTopic, light, path, players, port, url } from "~/config/config";
import events, { ReceiveEvent, SendEvent } from "~/events/events";

// Send light info
function sendLightOn(client: mqtt.MqttClient, playerTopic: string, column: number) {
  const lightArray = new Array(4).fill(false);
  lightArray[column] = true;
  client.publish(`${gameTopic}/${playerTopic}/${light}`, JSON.stringify(lightArray), resp => console.log("cb", resp));
}

const playerTopics = `${gameTopic}/${players}`;
const controllerTopic = (mac: string) => `${gameTopic}/${mac}/${controller}`;

let controllersMac: string[] = [];

export const Mqtt = (): React.JSX.Element => {
  const [client, setClient] = useState<mqtt.MqttClient>();
  const [connectStatus, setConnectStatus] = useState("");

  useEffect(() => {
    if (client) {
      // console.log(client);
      client.on('connect', () => {
        events.emit("log", "conected")
        setConnectStatus('Connected');

        // Subscription to get controllers
        client.subscribe(playerTopics);

        events.on(SendEvent.Light, (playerMac: string, column: number) => {
          sendLightOn(client, playerMac, column);
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
        events.emit("log",topic, message.toString())

        // Controllers mac (handles player connect and disconnect)
        if (topic == playerTopics) {

        
          // Parse json message as array of string
          const newControllersMac = JSON.parse(message.toString()) as string[];

          // Get added and removed controllers
          const addedControllers = newControllersMac.filter( mac => !controllersMac.includes(mac) )
          const removedControllers = controllersMac.filter( mac => !newControllersMac.includes(mac))
          
          // Emit added mac adresses (player connect)
          addedControllers.forEach( mac => events.emit(ReceiveEvent.Connect, mac) );
         
          // Emit removed mac adresses (player disconnect)
          removedControllers.forEach( mac => events.emit(ReceiveEvent.Disconnect, mac) );

          // Unsubscribe to removed controllers
          removedControllers.forEach(mac => client.unsubscribe(controllerTopic(mac)));

          // Subscribe to added controllers
          addedControllers.forEach(mac => client.subscribe(controllerTopic(mac)));

          controllersMac = newControllersMac;
          
          return;
        }

        // Check if message comes from a controller
        const currentControllerMac = controllersMac.find(mac => topic === controllerTopic(mac));
        if (currentControllerMac === undefined) return;

        const buttonArray: boolean[] = JSON.parse(message.toString()) as boolean[];

        // Get first column in bool
        const buttonId = buttonArray.findIndex(v => v === true);
        events.emit("log", buttonId, buttonArray);

        // Emit button of controller
        events.emitInput(currentControllerMac, buttonId);
      });
    } else {
      setConnectStatus('Connecting');
      setClient(mqtt.connect(url, { port, path }));
    }

    return () => {
      if (client === undefined) return;
      client.end(() => {
        setConnectStatus('Disconnected');
      });
    }
  }, [client]);

  return <></>
}