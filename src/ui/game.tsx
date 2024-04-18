import React from "react";
import { Card } from "../cards";
import { BoardState, Highlight, HighlightedBoard } from "./board/board";

import './game.css';

export interface CardPosition {
    row: number
    column: number
}

export interface Swap {
    from: CardPosition,
    to: CardPosition,
}

export function Game({
    board,
    requestSwapCandidates,
    requestSwap,
}: {
    board: BoardState,
    requestSwapCandidates(card: CardPosition): Array<CardPosition>,
    requestSwap(swapRequest: Swap): 'accept' | 'reject',
}): JSX.Element {
    const [selectedCardPosition, setSelectedCardPosition] = React.useState<CardPosition | null>(null);

    function isSelected(card: CardPosition) {
        return selectedCardPosition?.row === card.row && selectedCardPosition?.column === card.column;
    }

    function handleCardSelection(card: Card | null, row: number, column: number) {
        const cardPosition: CardPosition = { row, column };

        if (selectedCardPosition != null) {
            if (isSelected(cardPosition)) {
                // The selected card was selected again, meaning that it should be de-selected.
                setSelectedCardPosition(null);
                return;
            }

            const swapRequest: Swap = {
                from: {
                    row: selectedCardPosition.row,
                    column: selectedCardPosition.column,

                },
                to: cardPosition
            };
            if (requestSwap(swapRequest) === "reject") {
                // The request has been rejected, meaning that the two selected cards cannot be swapped.
                // The initially selected card thus remains selected and we simply discard this selection event.
                return;
            };

            // The request has been accepted, meaning that the swap has been handled.
            // We thus reset the selection.  The impact of the result will be reflected in the game state.
            setSelectedCardPosition(null);
            return;
        }

        console.log(`selected card @ ${row},${column} (${card?.rank} of ${card?.suit})`)
        setSelectedCardPosition({ row, column });
    }

    const highlights = React.useMemo<Array<Highlight>>(() => {
        if (selectedCardPosition === null) return [];

        const swapCandidates = requestSwapCandidates(selectedCardPosition);

        return [
            {
                spot: selectedCardPosition,
                highlight: 'selection'
            },
            ...swapCandidates.map(it => ({
                spot: it,
                highlight: 'swap-candidate' as const,
            }))
        ]
    }, [selectedCardPosition]);

    return <HighlightedBoard
        state={board}
        highlights={highlights}
        onCardSelect={handleCardSelection} />
}
