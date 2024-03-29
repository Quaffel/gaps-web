import { CardRow } from "./card-row";

import "./board.css";
import { Card } from "../../cards";
import { CardPosition } from "../game";
import { CardSpotState } from "./card";
import React from "react";

export type Row<T> = Array<T>;
export type Board<T> = Array<Row<T>>

export type BoardState = Board<Card | null>;

export function Board({
    rows,
    onCardSelect
}: {
    rows: Array<Row<CardSpotState>>,
    onCardSelect?: (card: Card | null, row: number, column: number) => void
}): JSX.Element {
    return <div className="card-area">
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

    return <Board rows={cardState} onCardSelect={onCardSelect} />
}