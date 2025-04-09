import { useEffect, useRef, useState } from "react";
import { PLAYERS } from "~/constants/gameConfig";
import { COLORS } from "~/theme/colors";
import GameCanvas from "./GameCanvas";
import { musicTracks } from "~/data/musicTrack";

export default function GameBoard() {
    const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [shouldStart, setShouldStart] = useState(false);

    const bgMusicRef = useRef<HTMLAudioElement | null>(null);

    const startGame = () => {
        const music = new Audio(selectedTrack.audioSrc);
        bgMusicRef.current = music;
        music.volume = 0.5;
        music.loop = false;

        let count = 3;
        setCountdown(count);

        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count === 0) {
                clearInterval(countdownInterval);
                setCountdown(null);
                music.play();
                setShouldStart(true);
                setGameStarted(true);
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    useEffect(() => {
        return () => {
            bgMusicRef.current?.pause();
            bgMusicRef.current = null;
        };
    }, []);

    return (
        <div className="flex flex-col gap-7 items-center">
            <h1 className="text-4xl">Rythme Challenge</h1>

            {!gameStarted && (
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-white">Select Music Track</h2>
                    <select
                        className="text-black p-1"
                        onChange={(e) => {
                            const track = musicTracks.find(
                                (m) => m.name === e.target.value
                            );
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
                    <button
                        onClick={startGame}
                        className=" px-4 py-1 bg-pink-500 text-white"
                    >
                        Start Game
                    </button>
                </div>
            )}

            {countdown !== null && (
                <div className="text-4xl font-bold text-white animate-pulse">
                    {countdown === 1 ? "GO!" : countdown}
                </div>
            )}

            <div className="flex gap-32">
                <GameCanvas
                    playerId={PLAYERS.ONE}
                    borderColor={COLORS.borderColorPink}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                />
                <GameCanvas
                    playerId={PLAYERS.TWO}
                    borderColor={COLORS.borderColorBlue}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                />
            </div>
        </div>
    );
}
