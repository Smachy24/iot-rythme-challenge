import { musicTracks } from "~/data/musicTrack";
import type { IPlayer } from "~/matter/PlayerManager";

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
}: MusicTrackSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl uppercase tracking-wider">
        Select Music Track
      </h2>

      <select
        className="
        text-white
        text-xl
        uppercase
        bg-pink-500
        border-2 border-pink-400
        cursor-pointer
        px-6
        py-2
        shadow-[0_8px_0_#b03675]
        transition-all duration-100
        relative
        active:shadow-[0_2px_0_#b03675]
        active:top-[2px]
      "
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
