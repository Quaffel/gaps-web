import { Board, Card, RankValues, SuitValues } from "../cards";
import { CardPosition, Game, Swap } from "../ui/game";

const testBoardState: Board<Card | null> = SuitValues.map(suit => RankValues.map(rank => ({
    rank, suit
})));

testBoardState[1][2] = null;

function getAt(position: CardPosition): Card | null {
    return testBoardState[position.row][position.column];
}

function setAt(position: CardPosition, value: Card | null): void {
    testBoardState[position.row][position.column] = value;
}

export function GameDemo() {
    function requestSwap(request: Swap): 'accept' | 'reject' {
        const fromPosition = request.from;
        const toPosition = request.to;

        const fromCard = getAt(fromPosition);
        const toCard = getAt(toPosition);

        setAt(fromPosition, toCard);
        setAt(toPosition, fromCard);
        return 'accept';
    }

    return <Game state={{
        board: testBoardState,
        pastSwaps: 0
    }} requestSwap={requestSwap} />
}
