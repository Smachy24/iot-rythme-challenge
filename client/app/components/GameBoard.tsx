import { PLAYERS } from "~/constants/gameConfig";
import { COLORS } from "~/theme/colors";
import GameCanvas from "./GameCanvas";

export default function GameBoard() {
    return (
        <div className="flex flex-col gap-7 items-center">
            <h1 className="text-4xl">Rythme Challenge</h1>
            <div className="flex gap-32">
                <GameCanvas playerId={PLAYERS.ONE} borderColor={COLORS.borderColorPink} />
                <GameCanvas playerId={PLAYERS.TWO} borderColor={COLORS.borderColorBlue} />
            </div>
        </div>
    );
}
