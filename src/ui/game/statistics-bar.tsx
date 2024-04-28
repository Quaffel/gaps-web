import { VerticalBar } from "../common/vertical-bar";

export interface GameStatistics {
    score: number
}

export function StatisticsBar({
    statistics,
}: {
    statistics: GameStatistics,
}): JSX.Element {
    return <VerticalBar>
        <label>Play yourself</label>
        <span>Score: {statistics.score.toFixed(2)}</span>
    </VerticalBar>;
}
