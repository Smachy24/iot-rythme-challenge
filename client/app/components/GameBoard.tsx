import { useEffect, useRef, useState } from "react";
import { musicTracks } from "~/data/musicTrack";
import { COLORS } from "~/theme/colors";
import GameCanvas from "./GameCanvas";

// Todo: add dynamically player canvas, and maybe add a text when there is no players ?

export default function GameBoard() {
    const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [shouldStart, setShouldStart] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    // const [playerScores, setPlayerScores] = useState<{ [key: string]: number }>();
    const [gameInstanceId, setGameInstanceId] = useState(0);
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

    const handleFinalScore = (playerMac: string) => (score: number) => {
        // setPlayerScores((prev) => ({
        //     ...prev,
        //     [playerMac]: score,
        // }));
    };

    const resetGame = () => {
        setGameStarted(false);
        setShouldStart(false);
        setGameOver(false);
        setCountdown(null);
        // setPlayerScores({ 1: 0, 2: 0 });
        setGameInstanceId((id) => id + 1);
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
                    {
                    /*

                        <p>Player 1: {playerScores[1]}</p>
                    <p>Player 2: {playerScores[2]}</p>

                    <h2 className="text-3xl mt-4 font-bold">
                        {playerScores[1] > playerScores[2]
                            ? "Player 1 wins!"
                            : playerScores[2] > playerScores[1]
                            ? "Player 2 wins!"
                            : "Draw!"}
                    </h2>
                    */
                    }
                    <button
                        className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
                        onClick={resetGame}
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="flex gap-32">
                <GameCanvas
                    key={`player-1-${gameInstanceId}`}
                    playerMac={"0013a20041582fc1"}
                    borderColor={COLORS.borderColorPink}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                    /*
                    onFinalScore={handleFinalScore(PLAYERS.ONE)}
                    */
                />
                <GameCanvas
                    key={`player-2-${gameInstanceId}`}
                    playerMac={"bee"}
                    borderColor={COLORS.borderColorBlue}
                    selectedTrack={selectedTrack}
                    shouldStart={shouldStart}
                    /*
                    onFinalScore={handleFinalScore(PLAYERS.TWO)}
                    */
                />
            </div>
        </div>
    );
}
