import { Card, RankValues, SuitValues } from "../cards";
import { Board } from "../ui/board/board";
import { Swap } from "../ui/game";
import { GamePlayback } from "../ui/game-playback";

const sampleInitialBoard: Board<Card | null> = SuitValues.map(suit => RankValues.map(rank => ({
    rank, suit
})));

sampleInitialBoard[1][2] = null;

const sampleSwaps: Array<Swap> = [
    {
        from: {
            column: 1,
            row: 1,
        },
        to: {
            column: 2,
            row: 2,
        }
    }, {
        from: {
            column: 3,
            row: 3,
        },
        to: {
            column: 4,
            row: 3,
        }
    }
];

export function PlaybackDemo(): JSX.Element {
    return <GamePlayback initialBoard={sampleInitialBoard} swaps={sampleSwaps} />
}
