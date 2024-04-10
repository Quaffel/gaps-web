import React from "react";
import { BoardState } from "../../logic/BoardState";
import { Card, CardPosition } from "../../logic/Card";
import { CardTile } from "./card";

import "./board.css";
const board = new BoardState(4, 13);

export function Board() {
    const [rows, setRows] = React.useState(4);
    const [columns, setColumns] = React.useState(13);
    const [selectedCard, setSelectedCard] = React.useState<CardPosition | null>(null);
    const [moveableCards, setMoveableCards] = React.useState<CardPosition[]>([]);
    const [possibleGaps, setPossibleGaps] = React.useState<CardPosition[]>([]);
    const [state, setState] = React.useState<readonly (Card | null)[][]>([]);

    function updateState() {
        setState([...board.state]);
    }
    
    function performMove(from: CardPosition, to: CardPosition) {
        board.requestMove(from, to);
        setSelectedCard(null);
        setMoveableCards(board.getMoveableCards());
        setPossibleGaps([]);
    }

    function handleCardSelect(card: Card | null, position: CardPosition) {
        if (card === null) {
            performMove(selectedCard!, position);
            return;
        }

        if (position.row === selectedCard?.row && position.column === selectedCard?.column) {
            setSelectedCard(null);
            setMoveableCards(board.getMoveableCards());
            return;
        }

        setSelectedCard({ row: position.row, column: position.column });
        setMoveableCards([]);
        setPossibleGaps(board.getCandidateGaps(position));

        console.log(
            `selected card: ${card?.rank} of ${card?.suit} from row ${position.row} and column ${position.column}`
        );
    }

    function initializeBoard() {
        board.reset(rows, columns);
        board.removeHighestCards();
        board.shuffle();
        setMoveableCards(board.getMoveableCards());
        updateState();
    }

    React.useEffect(() => {
        initializeBoard();
    }, [rows, columns]);

    return (
        <div className="board">
            {state.map((row, rowIdx) => (
                <div className="card-row" key={rowIdx}> 
                    {row.map((it, columnIdx) => (
                        <CardTile
                            isCandidate={possibleGaps.some((gap) => gap.row === rowIdx && gap.column === columnIdx)}
                            isMoveable={moveableCards.some((moveable) => moveable.row === rowIdx && moveable.column === columnIdx)}
                            isSelected={selectedCard?.row === rowIdx && selectedCard?.column === columnIdx}
                            key={columnIdx}
                            card={it}
                            onSelect={() => handleCardSelect(it, { row: rowIdx, column: columnIdx })}
                        />
                    ))}
                </div>
            ))}
            <button onClick={initializeBoard}>New game</button>
            <div>
                <input type="number" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
                <input type="number" value={columns} onChange={(e) => setColumns(Number(e.target.value))} />
            </div>
        </div>
    );
}
