import React from "react";
import ReactDOM from "react-dom/client";
import { Board } from "./ui/board";
import { BoardState } from "./logic/BoardState";
import { Card, CardPosition } from "./logic/Card";

import "./index.css";

const board = new BoardState(4, 13);
const loadedSeed = localStorage.getItem("seed");
if (loadedSeed !== null) {
    board.loadSeed(loadedSeed);
} else {
    board.removeHighestCards();
}

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function Index() {
    const [rows, setRows] = React.useState(board.rows);
    const [columns, setColumns] = React.useState(board.columns);
    const [selectedCard, setSelectedCard] = React.useState<CardPosition | null>(
        null
    );
    const [moveableCards, setMoveableCards] = React.useState<CardPosition[]>(
        []
    );
    const [possibleGaps, setPossibleGaps] = React.useState<CardPosition[]>([]);
    const [state, setState] = React.useState(board.state);
    const [verifyValidMove, setVerifyValidMove] = React.useState<boolean>(false);
    const [seed, setSeed] = React.useState(board.computeSeed());
    const [loading, setLoading] = React.useState(false);
    const [missPlacedCardsCount, setMissPlacedCardsCount] = React.useState(0);
    const [maxDepth, setMaxDepth] = React.useState(15000);
    const [animationDelay, setAnimationDelay] = React.useState(200);

    React.useEffect(() => {
        board.onUpdate = () => {
            const size = board.rows * board.columns;
            setState([...board.state]);
            setMissPlacedCardsCount(size - board.getWellPlacedCards().length);
            const seed = board.computeSeed();
            localStorage.setItem("seed", seed);
            setSeed(board.computeSeed());
            setRows(board.rows);
            setColumns(board.columns);
            resetHand();
        };

        const size = board.rows * board.columns;
        resetHand();
        setMissPlacedCardsCount(size - board.getWellPlacedCards().length);
        document.getElementById("rows")!.setAttribute("value", String(board.rows));
        document.getElementById("columns")!.setAttribute("value", String(board.columns));
    }, []);

    function resetHand() {
        setMoveableCards(board.getMoveableCards().map(({from}) => from));
        setPossibleGaps([]);
        setSelectedCard(null);
    }

    // 4.4 3.0 3.2 1.0 x.x 0.1 x.x 1.1 2.0 3.1 2.2 x.x 0.0 1.2 2.1 0.2 x.x
    async function performAStar() {
        const size = board.rows * board.columns;
        
        console.log(seed);
        setLoading(true);
        await wait(100)

        const path = await board.aStar((bs) => {
            const functions = [
                size - bs.getWellPlacedCards().length,
                bs.getStuckGaps().length,
                bs.getDoubleGaps().length
            ]
            const weights = [3, 30, 1];
            return functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        }, maxDepth);

        if (path.length === 0) {
            setLoading(false);
            return;
        }

        const isSolved = path[path.length - 1].isSolved();
        console.log(path, `isSolved: ${isSolved}`);
        for (const p of path) {
            board.load(p);
            await wait(animationDelay);
        }
        setLoading(false);
    }

    function initializeBoard(rows: number = board.rows, columns: number = board.columns) {
        board.reset(rows, columns);
        board.removeHighestCards();
    }

    function shuffleBoard() {
        board.shuffle();
    }

    function performMove(from: CardPosition, to: CardPosition) {
        board.requestMove(from, to, verifyValidMove);
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
            resetHand();
            return;
        }

        setSelectedCard({ row: position.row, column: position.column });
        setMoveableCards([]);
        setPossibleGaps(board.getCandidateGaps(position));

        console.log(
            `selected card: ${card?.rank} of ${card?.suit} from row ${position.row} and column ${position.column}`
        );
    }

    function handleChangeColumns(e: React.ChangeEvent<HTMLInputElement>) {
        const newColumns = Number(e.target.value);
        if (Number.isNaN(newColumns)) {
            return;
        }
        if (newColumns < 1 || newColumns > 13) {
            return;
        }
        setColumns(newColumns);
        initializeBoard(rows, newColumns);
    }

    function handleChangeRows(e: React.ChangeEvent<HTMLInputElement>) {
        const newRows = Number(e.target.value);
        if (Number.isNaN(newRows)) {
            return;
        }
        if (newRows < 1 || newRows > 4) {
            return;
        }
        setRows(newRows);
        initializeBoard(newRows, columns);
    }

    function handleChangeSeed(_: any) {
        const seedElement = document.getElementById("seed") as HTMLInputElement;
        setSeed(seedElement.value);
        board.loadSeed(seedElement.value);
    }

    return (
        <div>
            <div>
                <p>{seed}</p>
            </div>
            <div>
                <p>{missPlacedCardsCount}</p>
            </div>
            <Board
                state={state}
                rows={rows}
                columns={columns}
                moveableCards={moveableCards}
                possibleGaps={possibleGaps}
                selectedCard={selectedCard}
                handleCardSelect={handleCardSelect}
            />
            <div>
                {loading && <p>Loading...</p>}
                <button disabled={loading} onClick={() => initializeBoard()}>Reset</button>
                <button disabled={loading} onClick={shuffleBoard}>Shuffle</button>
                <button disabled={loading} onClick={performAStar}>A*</button>
                <button disabled={loading} onClick={() => console.log(board.getChildren())}>Console log children</button>
                <div>
                    <div>
                        <label>Verify valid move</label>
                        <input
                            disabled={loading} 
                            type="checkbox"
                            checked={verifyValidMove}
                            onChange={(e) => setVerifyValidMove(e.target.checked)}
                        />
                    </div>

                    <div>
                        <label>Rows</label>
                        <input
                            disabled={loading}
                            type="text"
                            pattern="[0-9]*"
                            id="rows"
                            onBlur={handleChangeRows}
                        />
                    </div>

                    <div>
                        <label>Columns</label>
                        <input
                            disabled={loading}
                            type="text"
                            pattern="[0-9]*"
                            id="columns"
                            onBlur={handleChangeColumns}
                        />
                    </div>

                    <div>
                        <label>Max depth</label>
                        <input
                            disabled={loading}
                            type="number"
                            value={maxDepth}
                            onChange={(e) => setMaxDepth(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label>Animation delay</label>
                        <input
                            disabled={loading}
                            type="number"
                            value={animationDelay}
                            onChange={(e) => setAnimationDelay(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <input disabled={loading} type="text" id="seed"/>
                        <button disabled={loading} onClick={handleChangeSeed}>Load seed</button>
                    </div>
                </div>
            </div>

            {/* <hr/>

            <span style={{ opacity: .5 }}>
                <Board
                    state={state}
                    rows={rows}
                    columns={columns}
                    moveableCards={moveableCards}
                    possibleGaps={possibleGaps}
                    selectedCard={selectedCard}
                />
            </span> */}
        </div>
    );
}

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
        <Index />
    </React.StrictMode>
);
