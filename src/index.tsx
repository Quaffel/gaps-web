import React from "react";
import ReactDOM from "react-dom/client";
import { Board } from "./ui/board";
import { BoardState } from "./logic/BoardState";
import { Card, CardPosition, Move } from "./logic/Card";

import "./index.css";
import { MCTS } from "./logic/MCTS";
import { AStar } from "./logic/AStar";
import { State } from "./logic/State";

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
    const [rows, setRows] = React.useState(board.getRows());
    const [columns, setColumns] = React.useState(board.getColumns());
    const [selectedCard, setSelectedCard] = React.useState<CardPosition | null>(
        null
    );
    const [moveableCards, setMoveableCards] = React.useState<CardPosition[]>(
        []
    );
    const [possibleGaps, setPossibleGaps] = React.useState<CardPosition[]>([]);
    const [state, setState] = React.useState(board.getState());
    const [verifyValidMove, setVerifyValidMove] = React.useState<boolean>(false);
    const [seed, setSeed] = React.useState(board.getSeed());
    const [loading, setLoading] = React.useState(false);
    const [missPlacedCardsCount, setMissPlacedCardsCount] = React.useState(0);
    const [maxDepth, setMaxDepth] = React.useState(10000);
    const [animationDelay, setAnimationDelay] = React.useState(50);
    const [score, setScore] = React.useState(0);

    React.useEffect(() => {
        board.onUpdate = () => {
            const rows = board.getRows();
            const columns = board.getColumns();
            const size = board.getSize();
            setState([...board.getState()]);
            setScore(board.getScore());
            setMissPlacedCardsCount(size - board.getWellPlacedCards().length);
            const seed = board.getSeed();
            localStorage.setItem("seed", seed);
            setSeed(board.getSeed());
            setRows(rows);
            setColumns(columns);
            resetHand();
        };

        const size = board.getSize();
        resetHand();
        setMissPlacedCardsCount(size - board.getWellPlacedCards().length);
        document.getElementById("rows")!.setAttribute("value", String(board.getRows()));
        document.getElementById("columns")!.setAttribute("value", String(board.getColumns()));
    }, []);

    function resetHand() {
        setMoveableCards(board.getPossibleActions().map(({from}) => from));
        setPossibleGaps([]);
        setSelectedCard(null);
    }

    // 4.4 3.0 3.2 1.0 x.x 0.1 x.x 1.1 2.0 3.1 2.2 x.x 0.0 1.2 2.1 0.2 x.x
    async function performAStar() {
        console.log(seed);
        setLoading(true);
        await wait(100)

        const heuristicFn = (bs: State<Move>) => {
            const board = bs as BoardState;
            const functions = [
                board.getSize() - board.getWellPlacedCards().length,
                board.getStuckGaps().length,
                board.getDoubleGaps().length,
            ]
            const weights = [2, 1000, 1];
            return functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        }

        const astar = new AStar.AStarSearch(board, maxDepth, heuristicFn);
        const path = astar.findPath();

        if (path === null) {
            console.log("No solution found");
            return;
        }

        for (let i = 0; i < path.length; i++) {
            board.load(path[i] as BoardState);
            await wait(animationDelay);
        }

        setLoading(false);
    }

    async function performMCTS() {
        console.log(seed);
        setLoading(true);
        await wait(100)

        const mcts = new MCTS.MCTSSearch(board);

        let nextMove = board;
        while (board.isTerminal() === false) {
            nextMove = await mcts.findNextMove(board, maxDepth) as BoardState;
            board.load(nextMove);
            await wait(animationDelay);
        }

        setLoading(false);
    }

    function initializeBoard(rows: number = board.getRows(), columns: number = board.getColumns()) {
        board.reset(rows, columns);
        board.removeHighestCards();
    }

    function shuffleBoard() {
        board.shuffle();
    }

    function performMove(from: CardPosition, to: CardPosition) {
        board.requestAction({from, to}, verifyValidMove);
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

    function handleChangeSeed(e: any) {
        const seedElement = document.getElementById("seed") as HTMLInputElement;
        setSeed(seedElement.value);
        board.loadSeed(seedElement.value);
    }

    return (
        <div>
            <div>
                <p>{seed}</p>
                <p>{missPlacedCardsCount}</p>
                <p>{score}</p>
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
                <button disabled={loading} onClick={performMCTS}>MCTS</button>
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
