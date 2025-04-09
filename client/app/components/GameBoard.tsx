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
    const [gameOver, setGameOver] = useState(false);
    const [playerScores, setPlayerScores] = useState<{ [key: number]: number }>(
        {
            1: 0,
            2: 0,
        }
    );

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

                music.onended = () => {
                    setShouldStart(false);
                    setGameOver(true);
                };
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    const handleFinalScore = (playerId: number) => (score: number) => {
        setPlayerScores((prev) => ({
            ...prev,
            [playerId]: score,
        }));
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

            {gameOver && (
                <div className="mt-6 text-center text-white">
                    <h2 className="text-2xl mb-2">Final Scores</h2>
                    <p>Player 1: {playerScores[1]}</p>
                    <p>Player 2: {playerScores[2]}</p>

                    <h2 className="text-3xl mt-4 font-bold">
                        {playerScores[1] > playerScores[2]
                            ? "Player 1 wins!"
                            : playerScores[2] > playerScores[1]
                            ? "Player 2 wins!"
                            : "Draw!"}
                    </h2>
                </div>
            )}

            <div className="flex gap-32">
                <GameCanvas
                    playerId={PLAYERS.ONE}
                    borderColor={COLORS.borderColorPink}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                    onFinalScore={handleFinalScore(PLAYERS.ONE)}
                />
                <GameCanvas
                    playerId={PLAYERS.TWO}
                    borderColor={COLORS.borderColorBlue}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                    onFinalScore={handleFinalScore(PLAYERS.TWO)}
                />
            </div>
        </div>
    );
}
