import React from "react";
import ReactDOM from "react-dom/client";
import { Board } from "./ui/board/board";

import "./index.css";
import { BoardState } from "./logic/BoardState";
import { Card, CardPosition } from "./logic/Card";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

const board = new BoardState(4, 13);

function Index() {
    const [rows, setRows] = React.useState(4);
    const [columns, setColumns] = React.useState(13);
    const [selectedCard, setSelectedCard] = React.useState<CardPosition | null>(
        null
    );
    const [moveableCards, setMoveableCards] = React.useState<CardPosition[]>(
        []
    );
    const [possibleGaps, setPossibleGaps] = React.useState<CardPosition[]>([]);
    const [state, setState] = React.useState(board.state);

    React.useEffect(() => {
        board.onUpdate = () => {
            setState([...board.state]);
        };
    }, []);

    function initializeBoard() {
        board.reset(rows, columns);
        board.removeHighestCards();
        board.shuffle();
        setMoveableCards(board.getMoveableCards());
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

        if (
            position.row === selectedCard?.row &&
            position.column === selectedCard?.column
        ) {
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

    React.useEffect(() => {
        initializeBoard();
    }, [rows, columns]);

    return (
        <div>
            <Board
                state={state}
                rows={rows}
                columns={columns}
                moveableCards={moveableCards}
                possibleGaps={possibleGaps}
                selectedCard={selectedCard}
                handleCardSelect={handleCardSelect}
            />
            <hr></hr>
            <Board
                state={state}
                rows={rows}
                columns={columns}
                moveableCards={moveableCards}
                possibleGaps={possibleGaps}
                selectedCard={selectedCard}
            />
            <button onClick={initializeBoard}>New game</button>
            <div>
                <input
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                />
                <input
                    type="number"
                    value={columns}
                    onChange={(e) => setColumns(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

root.render(
    <React.StrictMode>
        <Index />
    </React.StrictMode>
);
