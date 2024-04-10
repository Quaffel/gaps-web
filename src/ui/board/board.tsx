import React from "react";
import { BoardState } from "../../logic/BoardState";
import { Card, CardPosition } from "../../logic/Card";
import { CardTile } from "./card";

import "./board.css";

interface BoardProps {
    state: readonly (Card | null)[][];
    rows: number;
    columns: number;
    moveableCards: CardPosition[];
    possibleGaps: CardPosition[];
    selectedCard: CardPosition | null;
    handleCardSelect?: (card: Card | null, position: CardPosition) => void;
}

export function Board(props: BoardProps): JSX.Element{
    return (
        <div className="board">
            {props.state.map((row, rowIdx) => (
                <div className="card-row" key={rowIdx}> 
                    {row.map((it, columnIdx) => (
                        <CardTile
                            isCandidate={props.possibleGaps.some((gap) => gap.row === rowIdx && gap.column === columnIdx)}
                            isMoveable={props.moveableCards.some((moveable) => moveable.row === rowIdx && moveable.column === columnIdx)}
                            isSelected={props.selectedCard?.row === rowIdx && props.selectedCard?.column === columnIdx}
                            key={columnIdx}
                            card={it}
                            onSelect={() => props.handleCardSelect?.(it, { row: rowIdx, column: columnIdx })}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
