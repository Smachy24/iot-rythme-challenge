import { COLORS } from "~/theme/colors";

export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 700;
export const NUMBER_OF_COL = 4;

export const COL_GAP = WORLD_WIDTH / NUMBER_OF_COL;

export const COLUMNS_LIST = Array.from(
    { length: NUMBER_OF_COL },
    (_, i) => COL_GAP / 2 + i * COL_GAP
);

export const SQUARE_LIST = [
    { column: 0, input: "a", color: COLORS.red },
    { column: 1, input: "z", color: COLORS.green },
    { column: 2, input: "e", color: COLORS.blue },
    { column: 3, input: "r", color: COLORS.yellow },
];
