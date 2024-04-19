export function GameMetrics({
    misplacedCards,
    score,
}: {
    misplacedCards: number,
    score: number,
}): JSX.Element {
    return <div className="controls">
        <div>
            <div className="bold">Miss placed cards</div>
            <div>{misplacedCards}</div>
        </div>
        <div>
            <div className="bold">Score</div>
            <div>{score.toFixed(2)}</div>
        </div>
    </div>;
}
