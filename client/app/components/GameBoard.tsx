import { COLORS } from "~/theme/colors";
import GameCanvas from "./GameCanvas";

// Todo: add dynamically player canvas, and maybe add a text when there is no players ?

export default function GameBoard() {
    return (
        <div className="flex flex-col gap-7 items-center">
            <h1 className="text-4xl">Rythme Challenge</h1>
            <div className="flex gap-32">
                <GameCanvas playerMac={"0013a20041582fc1"} borderColor={COLORS.borderColorPink} />
                <GameCanvas playerMac={"bee"} borderColor={COLORS.borderColorBlue} />
            </div>
        </div>
    );
}
