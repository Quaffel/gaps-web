import { Board, BoardDimensions, swapCardsAt } from "../board";
import { Card, RANKS, SUITS } from "../cards";

export function generateSolvedBoard(dimensions: BoardDimensions): Board<Card | null> {
    if (isNaN(dimensions.rows) || isNaN(dimensions.columns))
        throw new Error("dimensions must be not NaN");
    if (dimensions.rows < 0 || dimensions.columns < 0)
        throw new Error("dimensions must be non-negative");
    if (dimensions.rows > SUITS.length || dimensions.columns > RANKS.length)
        throw new Error("specified dimensions must be in bounds of the available ranks and suits");

    return SUITS.slice(0, dimensions.rows).map(suit => {
        return [
            ...RANKS.slice(0, dimensions.columns - 1),
            null,
        ].map(rank => rank !== null ? { suit, rank } : null);
    });
}

export function generateShuffledBoard(dimensions: BoardDimensions): Board<Card | null> {
    // TODO: Extend to only generate valid/solvable boards
    const board = generateSolvedBoard(dimensions);
    console.log("solved board", board);

    for (let columnIdx = 0; columnIdx < dimensions.columns; columnIdx++) {
        for (let rowIdx = 0; rowIdx < dimensions.rows; rowIdx++) {
            let randomColumnIdx = Math.floor(Math.random() * dimensions.columns);
            let randomRowIdx = Math.floor(Math.random() * dimensions.rows);

            swapCardsAt(board, { row: rowIdx, column: columnIdx }, { row: randomRowIdx, column: randomColumnIdx });
        }
    }

    return board;
}
