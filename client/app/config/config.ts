enum ENV {
  URL = "VITE_WSS_URL",
  PORT = "VITE_WSS_PORT",
  PATH = "VITE_WSS_PATH",
  GAME_TOPIC = "VITE_WSS_GAME_TOPC",
  CONTROLLER_1 = "VITE_WSS_GAME_CONTROLLER_1",
  CONTROLLER_2 = "VITE_WSS_GAME_CONTROLLER_2",
  LIGHT_1 = "VITE_WSS_GAME_LIGHT_1",
  LIGHT_2 = "VITE_WSS_GAME_LIGHT_2",
}

function checkAndGetEnv(key: string): string {
  const value = import.meta.env[key];
  if (value == undefined) throw new Error(`No ${key} set in .env`);
  return value;
}

export const url = checkAndGetEnv(ENV.URL);
export const port = parseInt(checkAndGetEnv(ENV.PORT));
export const path = checkAndGetEnv(ENV.PATH);
export const gameTopic = checkAndGetEnv(ENV.GAME_TOPIC);
export const controller1 = checkAndGetEnv(ENV.CONTROLLER_1);
export const controller2 = checkAndGetEnv(ENV.CONTROLLER_2);
export const light1 = checkAndGetEnv(ENV.LIGHT_1);
export const light2 = checkAndGetEnv(ENV.LIGHT_1);