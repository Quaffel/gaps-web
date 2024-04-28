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
        <label>Game statistics</label>
        <span>Score: {statistics.score}</span>
    </VerticalBar>;
}
