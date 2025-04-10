import { COLORS } from "~/theme/colors";

export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 700;
export const NUMBER_OF_COL = 4;

export const COL_GAP = WORLD_WIDTH / NUMBER_OF_COL;

export const COLUMNS_LIST = Array.from(
    { length: NUMBER_OF_COL },
    (_, i) => COL_GAP / 2 + i * COL_GAP
);

export const GOOD_TIMING_BOX_LABEL = "goodTimingBox";
export const PERFECT_TIMING_BOX_LABEL = "perfectTimingBox";
export const MUSIC_NOTE_LABEL = "musicNote";


// Specify column note colors
export const MUSIC_NOTE_COLORS = [
    { column: 0, color: COLORS.red },
    { column: 1, color: COLORS.green },
    { column: 2, color: COLORS.blue },
    { column: 3, color: COLORS.yellow },
]

export enum PLAYERS {
    ONE = 1,
    TWO = 2
}

interface IKeybind {
    key: string
    column: number
}

// Links a key to a column
export const PLAYERS_KEYBIND: Record<PLAYERS, IKeybind[]>  = {
    [PLAYERS.ONE]: [
        { key: "a", column: 0 },
        { key: "z", column: 1 },
        { key: "e", column: 2 },
        { key: "r", column: 3 },
    ], 
    [PLAYERS.TWO]: [
        { key: "u", column: 0 },
        { key: "i", column: 1 },
        { key: "o", column: 2 },
        { key: "p", column: 3 },
    ]
}

export const MUSIC_NOTE_LIST = [
    { column: 0, input: "a", color: COLORS.red },
    { column: 1, input: "z", color: COLORS.green },
    { column: 2, input: "e", color: COLORS.blue },
    { column: 3, input: "r", color: COLORS.yellow },
];