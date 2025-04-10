import { musicTracks } from "~/data/musicTrack";
import type { IPlayer } from "~/matter/PlayerManager";

/**
 * Props for the MusicTrackSelector component.
 */
interface MusicTrackSelectorProps {
  selectedTrack: { name: string; bpm: number; audioSrc: string };
  setSelectedTrack: (track: {
    name: string;
    bpm: number;
    audioSrc: string;
  }) => void;
  startGame: () => void;
  players: IPlayer[];
}
export default function MusicTrackSelector({
  selectedTrack,
  setSelectedTrack,
  startGame,
  players,
}: MusicTrackSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-white">Select Music Track</h2>
      <select
        className="text-black p-1"
        onChange={(e) => {
          const track = musicTracks.find((m) => m.name === e.target.value);
          if (track) setSelectedTrack(track);
        }}
        value={selectedTrack.name}
      >
        {musicTracks.map((track) => (
          <option key={track.name} value={track.name}>
            {track.name} (BPM: {track.bpm})
          </option>
        ))}
      </select>
    </div>
  );
}
