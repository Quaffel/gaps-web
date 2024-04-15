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
const loadedMaxDepth = localStorage.getItem("maxDepth") || 10000;
const loadedAnimationDelay = localStorage.getItem("animationDelay") || 50;

const loadedShowHighlightStr = localStorage.getItem("showHighlight") 
const loadedShowHighlight = loadedShowHighlightStr === "true" ? true : false;

const loadedVerifyValidMoveStr = localStorage.getItem("verifyValidMove")
const loadedVerifyValidMove = loadedVerifyValidMoveStr === "true" ? true : false;

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
    const [verifyValidMove, setVerifyValidMove] = React.useState<boolean>(Boolean(loadedVerifyValidMove));
    const [seed, setSeed] = React.useState(board.getSeed());
    const [loading, setLoading] = React.useState(false);
    const [missPlacedCardsCount, setMissPlacedCardsCount] = React.useState(0);
    const [maxDepth, setMaxDepth] = React.useState(Number(loadedMaxDepth));
    const [animationDelay, setAnimationDelay] = React.useState(Number(loadedAnimationDelay));
    const [score, setScore] = React.useState(0);
    const [showHighlight, setShowHighlight] = React.useState(Boolean(loadedShowHighlight));

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
        setScore(board.getScore());
        setSeed(board.getSeed());
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
            const weights = [3, 5, 1];
            return functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        }

        const astar = new AStar.AStarSearch(board, maxDepth, heuristicFn);
        const path = astar.findPath();

        if (path === null) {
            console.log("No solution found");
            return;
        }

        const lastState = path[path.length - 1] as BoardState;
        console.log(`Solution found with score: ${lastState.getScore()}, is solved: ${lastState.isSolved()}`);

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
            if (selectedCard !== null) {
                performMove(selectedCard!, position);
            }
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

    function handleChangeSeed() {
        const seedElement = document.getElementById("seed") as HTMLInputElement;
        setSeed(seedElement.value);
        board.loadSeed(seedElement.value);
    }

    function handleChangeMaxDepth(e: React.ChangeEvent<HTMLInputElement>) {
        const newMaxDepth = Number(e.target.value);
        if (Number.isNaN(newMaxDepth)) {
            return;
        }
        if (newMaxDepth < 1) {
            return;
        }
        localStorage.setItem("maxDepth", String(newMaxDepth));
        setMaxDepth(newMaxDepth);
    }

    function handleChangeAnimationDelay(e: React.ChangeEvent<HTMLInputElement>) {
        const newAnimationDelay = Number(e.target.value);
        if (Number.isNaN(newAnimationDelay)) {
            return;
        }
        if (newAnimationDelay < 0) {
            return;
        }
        localStorage.setItem("animationDelay", String(newAnimationDelay));
        setAnimationDelay(newAnimationDelay);
    }

    function handleChangeShowHighlight(e: React.ChangeEvent<HTMLInputElement>) {
        setShowHighlight(e.target.checked);
        localStorage.setItem("showHighlight", String(e.target.checked));
    }

    function handleChangeVerifyValidMove(e: React.ChangeEvent<HTMLInputElement>) {
        setVerifyValidMove(e.target.checked);
        localStorage.setItem("verifyValidMove", String(e.target.checked));
    }

    return (
        <div className="py-3">
            <Board
                state={state}
                rows={rows}
                columns={columns}
                moveableCards={moveableCards}
                possibleGaps={possibleGaps}
                selectedCard={selectedCard}
                handleCardSelect={handleCardSelect}
                showHighlight={showHighlight}
            />
            <div className="px-3 py-5 flex justify-center align-center flex-column gap-3">
                {loading && <p className="bold">Loading...</p>}

                <div className="controls">
                    <div>
                        <div className="bold">Seed</div>
                        <div>{seed}</div>
                    </div>
                    <div>
                        <div className="bold">Miss placed cards</div>
                        <div>{missPlacedCardsCount}</div>
                    </div>
                    <div>
                        <div className="bold">Score</div>
                        <div>{score.toFixed(2)}</div>
                    </div>
                </div>

                <div className="form-group flex-row gap-2">
                    <button disabled={loading} onClick={() => initializeBoard()}>Reset</button>
                    <button disabled={loading} onClick={shuffleBoard}>Shuffle</button>
                    <button disabled={loading} onClick={performAStar}>A*</button>
                    <button disabled={loading} onClick={performMCTS}>MCTS</button>
                    <button disabled={loading} onClick={() => console.log(board.getChildren())}>Console log children</button>
                </div>
                
                <div className="flex flex-column gap-2 controls">
                    <div className="form-group flex-row">
                        <label>Verify valid move</label>
                        <input
                            disabled={loading} 
                            type="checkbox"
                            checked={verifyValidMove}
                            onChange={handleChangeVerifyValidMove}
                        />
                    </div>

                    <div className="form-group flex-row">
                        <label>Show highlight</label>
                        <input
                            disabled={loading} 
                            type="checkbox"
                            checked={showHighlight}
                            onChange={handleChangeShowHighlight}
                        />
                    </div>

                    <div className="form-group">
                        <label>Rows</label>
                        <input
                            placeholder="from 1 to 4"
                            disabled={loading}
                            type="text"
                            pattern="[0-9]*"
                            id="rows"
                            onBlur={handleChangeRows}
                        />
                    </div>

                    <div className="form-group">
                        <label>Columns</label>
                        <input
                            placeholder="from 1 to 13"
                            disabled={loading}
                            type="text"
                            pattern="[0-9]*"
                            id="columns"
                            onBlur={handleChangeColumns}
                        />
                    </div>

                    <div className="form-group">
                        <label>Algorithm complexity</label>
                        <div className="small-text">(A*: max closed nodes, MCTS: max iterations)</div>
                        <input
                            placeholder="How deep the search should go"
                            disabled={loading}
                            type="text"
                            pattern="[0-9]*"
                            value={maxDepth}
                            onChange={handleChangeMaxDepth}
                        />
                    </div>

                    <div className="form-group">
                        <label>Animation delay</label>
                        <input
                            placeholder="How long the animation should last"
                            disabled={loading}
                            type="number"
                            value={animationDelay}
                            onChange={handleChangeAnimationDelay}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="seed">Seed</label>
                        <div className="flex width-100 flex-1 flex-row gap-1">
                            <input placeholder={seed} disabled={loading} type="text" id="seed"/>
                            <button disabled={loading} onClick={handleChangeSeed}>Load seed</button>
                        </div>
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
