import Screen from "../Screen";

export default function Gameboard() {
    return (
        <div className="flex flex-col items-center border-2 border-amber-200">
            <h1 className="text-4xl text-white">Gameboard</h1>
            <Screen />
        </div>
    );
}
