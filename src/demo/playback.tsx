import { Card, RANKS, SUITS } from "../cards";
import { Board } from "../board";
import { Swap } from "../ui/game";
import { GamePlayback } from "../ui/game-playback";

// Same board as in './game.tsx'.
const sampleInitialBoard: Board<Card | null> = SUITS.map(suit => RANKS.map(rank => ({
    rank, suit
})));

sampleInitialBoard[1][2] = null;

// Swaps of cards (and empty spots, collectively referred to as "spots") are solely represented by the positions
// of the affected spots.
// The navigation controls are completely provided by the used 'GamePlayback' component.
// Please refer to its definition in case more fine-grained control is required.
// Automatic playback is not yet implemented, which is why the 'play' button is always grayed out.
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
