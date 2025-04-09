import { COLORS } from "~/theme/colors";

export type ScoreLabel = "perfect" | "good" | "ok" | "miss";

interface ScoreLabelAndPoint {
    score: number;
    label: ScoreLabel;
}

export const SCORE_MAPPING: Record<string, ScoreLabelAndPoint> = {
    perfect: {
        score: 100,
        label: "perfect",
    },
    good: {
        score: 50,
        label: "good",
    },
    ok: {
        score: 25,
        label: "ok",
    },
    miss: {
        score: -25,
        label: "miss",
    },
};

export const SCORE_COLOR_MAPPING: Record<ScoreLabel, string> = {
    perfect: COLORS.green,
    good: COLORS.yellow,
    ok: COLORS.blue,
    miss: COLORS.red,
};

export function getScore(
    yPositionFromLimit: number,
    maxValidYPosition: number
) {
    let { score, label } = SCORE_MAPPING.miss;

    if (yPositionFromLimit <= 10) {
        score = SCORE_MAPPING.perfect.score;
        label = SCORE_MAPPING.perfect.label;
    } else if (yPositionFromLimit <= 50) {
        score = SCORE_MAPPING.good.score;
        label = SCORE_MAPPING.good.label;
    } else if (yPositionFromLimit <= maxValidYPosition) {
        score = SCORE_MAPPING.ok.score;
        label = SCORE_MAPPING.ok.label;
    }
    return { score, label };
}
