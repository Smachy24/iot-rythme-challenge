export interface MusicTrack {
  name: string;
  audioSrc: string;
  bpm: number;
}

export const musicTracks: MusicTrack[] = [
  {
    name: "Demon slayer - Akeboshi",
    audioSrc: "/public/assets/musics/demon_slayer.mp3",
    bpm: 95,
  },
  {
    name: "Black Clover - Black Rover",
    audioSrc: "/public/assets/musics/black_rover.mp3",
    bpm: 102,
  },
  {
    name: "Dan da dan - Otonoke",
    audioSrc: "/public/assets/musics/dan_da_dan.mp3",
    bpm: 170,
  },
];
