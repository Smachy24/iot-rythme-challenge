enum ENV {
  URL = "VITE_WSS_URL",
  PORT = "VITE_WSS_PORT",
  PATH = "VITE_WSS_PATH",

  GAME = "VITE_WSS_GAME_TOPC",
  PLAYERS = "VITE_WSS_GAME_PLAYERS",
  LIGHT = "VITE_WSS_GAME_LIGHT",
  CONTROLLER = "VITE_WSS_GAME_CONTROLLER",
  
  GET_PLAYERS = "VITE_WSS_GAME_GET_PLAYERS",
  GET_PLAYERS_PAYLOAD = "VITE_WSS_GAME_GET_PLAYERS_PAYLOAD",
}

function checkAndGetEnv(key: string): string {
  const value = import.meta.env[key];
  if (value == undefined) throw new Error(`No ${key} set in .env`);
  return value;
}

export const url = checkAndGetEnv(ENV.URL);
export const port = parseInt(checkAndGetEnv(ENV.PORT));
export const path = checkAndGetEnv(ENV.PATH);
export const game = checkAndGetEnv(ENV.GAME);
export const players = checkAndGetEnv(ENV.PLAYERS);
export const getPlayers = checkAndGetEnv(ENV.GET_PLAYERS);
export const getPlayersPayload = checkAndGetEnv(ENV.GET_PLAYERS_PAYLOAD);
export const light = checkAndGetEnv(ENV.LIGHT);
export const controller = checkAndGetEnv(ENV.CONTROLLER);