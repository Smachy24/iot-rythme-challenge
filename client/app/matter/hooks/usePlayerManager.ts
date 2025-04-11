import { useEffect, useState } from "react";
import events from "~/events/events";
import { PlayerManager } from "../PlayerManager";
import type { IPlayer } from "../PlayerManager";

let playerManagerInstance: PlayerManager | null = null;

export function usePlayerManager() {
  const [players, setPlayers] = useState<IPlayer[]>([]);

  // Singleton instanciation
  if (!playerManagerInstance) {
    playerManagerInstance = new PlayerManager(events);
  }

  useEffect(() => {
    playerManagerInstance!.setOnUpdate(setPlayers);
  }, []);

  return {
    players,
    playerManager: playerManagerInstance,
  };
}
