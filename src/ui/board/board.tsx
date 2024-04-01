import { CardRow } from "./card-row";

import React from "react";
import { Board, Card, Row } from "../../cards";
import { CardPosition } from "../game";
import { CardSpotState } from "./card";

import "./board.css";

export type BoardState = Board<Card | null>;

export function PlainBoard({
    rows,
    onCardSelect
}: {
    rows: Array<Row<CardSpotState>>,
    onCardSelect?: (card: Card | null, row: number, column: number) => void
}): JSX.Element {
    return <div className="board">
        {rows.map((it, rowIdx) => <CardRow
            cards={it}
            onCardSelect={(card, columnIdx) => onCardSelect?.(card, rowIdx, columnIdx)} />)}
    </div>
}

export interface Highlight {
    spot: CardPosition
    highlight: CardSpotState["highlight"]
}

export function HighlightedBoard({
    state,
    highlights,
    onCardSelect
}: {
    state: BoardState,
    highlights: Array<Highlight>,
    onCardSelect?: (card: Card | null, row: number, column: number) => void
}): JSX.Element {
    const cardState = React.useMemo<Board<CardSpotState>>(() => state.map(
        (row, rowIdx) => row.map((card, cardIdx) => {
            const highlight = highlights.find(it => it.spot.row === rowIdx && it.spot.column === cardIdx)?.highlight;

            return {
                card,
                highlight: highlight ?? 'none'
            };
        })
    ), [state, highlights]);

    return <PlainBoard rows={cardState} onCardSelect={onCardSelect} />
}
