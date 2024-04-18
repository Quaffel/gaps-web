import { Card, RANKS, SUITS } from "../cards";
import { Board } from "../board";
import { CardPosition, Game, Swap } from "../ui/game";

// A board is a nested array, whereby the outer array represents the rows and the inner array the columns.
// A value of type 'Card' represents an actual card, 'null' represents an empty spot.
// Here, we generate a board on which all cards of the same suit (hearts, spades, ...) are in the same row and
// its ranks are sorted in ascending order.
const testBoardState: Board<Card | null> = SUITS.map(suit => RANKS.map(rank => ({
    rank, suit
})));

// We introduce an empty spot/a hole for demonstration purposes.
testBoardState[1][2] = null;

function getAt(position: CardPosition): Card | null {
    return testBoardState[position.row][position.column];
}

function setAt(position: CardPosition, value: Card | null): void {
    testBoardState[position.row][position.column] = value;
}

export function GameDemo() {
    // Indicates which other cards the specified card can be swapped with (the so-called "candidate" cards).
    // This information is used to highlight the candidate cards.
    function requestSwapCandidates(card: CardPosition): Array<CardPosition> {
        return [{
            column: Math.max(0, card.column - 1),
            row: Math.max(0, card.row - 1),
        }];
    }

    // Informs this component that the user would like to perform a swap (i.e., they selected a second card).
    // Note that while the UI code ensures that a card is not swapped with itself, it does not ensure consistency
    // with 'requestSwapCandidates'. That is, this function is also called for cards that have not previously
    // been reported as candidates.
    function requestSwap(request: Swap): 'accept' | 'reject' {
        const fromPosition = request.from;
        const toPosition = request.to;

        if (Math.max(0, fromPosition.column - 1) !== toPosition.column
            || Math.max(0, fromPosition.row - 1) !== toPosition.row) {
            return 'reject';
        }

        const fromCard = getAt(fromPosition);
        const toCard = getAt(toPosition);

        setAt(fromPosition, toCard);
        setAt(toPosition, fromCard);
        return 'accept';
    }

    return <Game board={testBoardState} requestSwap={requestSwap} requestSwapCandidates={requestSwapCandidates} />
}
