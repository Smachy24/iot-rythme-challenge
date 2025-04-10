enum ENV {
  URL = "VITE_WSS_URL",
  PORT = "VITE_WSS_PORT",
  PATH = "VITE_WSS_PATH",
  GAME_TOPIC = "VITE_WSS_GAME_TOPC",
  PLAYER_1 = "VITE_WSS_GAME_PLAYER_1",
  PLAYER_2 = "VITE_WSS_GAME_PLAYER_2",
  LIGHT = "VITE_WSS_GAME_LIGHT",
  CONTROLLER = "VITE_WSS_GAME_CONTROLLER",
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
export const player1 = checkAndGetEnv(ENV.PLAYER_1);
export const player2 = checkAndGetEnv(ENV.PLAYER_2);
export const light = checkAndGetEnv(ENV.LIGHT);
export const controller = checkAndGetEnv(ENV.CONTROLLER);