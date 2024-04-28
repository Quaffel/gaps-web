import { Card, cardsEqual } from "./cards";

export type Row<T> = Array<T>;
export type Board<T> = Array<Row<T>>

export interface BoardDimensions {
    rows: number,
    columns: number,
}

export interface CardPosition {
    row: number
    column: number
}

export function getCardAt(board: Board<Card | null>, position: CardPosition): Card | null {
    return board[position.row][position.column];
}

export function setCardAt(board: Board<Card | null>, position: CardPosition, value: Card | null): void {
    board[position.row][position.column] = value;
}

export function getRowCount(board: Board<Card | null>): number {
    return board.length;
}

export function getColumnCount(board: Board<Card | null>): number {
    return board[0].length;
}

export function getCellCount(board: Board<Card | null>): number {
    return getRowCount(board) * getColumnCount(board);
}

export function boardsEqual(first: Board<Card | null>, second: Board<Card | null>): boolean {
    const rowCount = getRowCount(first);
    const columnCount = getColumnCount(first);

    if (rowCount !== getRowCount(second) || columnCount !== getColumnCount(second)) {
        return false;
    }

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            const position = { row: i, column: j };

            const firstCard = getCardAt(first, position);
            const secondCard = getCardAt(second, position);

            if (!cardsEqual(firstCard, secondCard)) {
                return false;
            }
        }
    }

    return true;
}

export function mapBoard<T>(
    board: Board<Card | null>,
    fn: (card: Card | null, position: CardPosition) => T,
): Board<T> {
    return board.map((row, rowIdx) => {
        return row.map((card, columnIdx) => {
            return fn(card, { row: rowIdx, column: columnIdx })
        });
    });
}

export function flatMapBoard<T>(
    board: Board<Card | null>,
    fn: (card: Card | null, position: CardPosition) => T,
): T[] {
    return board.flatMap((row, rowIdx) => {
        return row.map((card, columnIdx) => {
            return fn(card, { row: rowIdx, column: columnIdx })
        })
    });
}

export function filterBoard(
    board: Board<Card | null>,
    fn: (card: Card | null, position: CardPosition) => boolean
): Array<{ card: Card | null, position: CardPosition }> {
    const cards = flatMapBoard(board, (card, position) => ({ card, position }));
    return cards.filter(({ card, position }) => fn(card, position));
}

export function swapCardsAt(board: Board<Card | null>, from: CardPosition, to: CardPosition): void {
    const previousFrom = getCardAt(board, from);
    setCardAt(board, from, getCardAt(board, to));
    setCardAt(board, to, previousFrom);
}

export function withCardsSwapped(board: Board<Card | null>, from: CardPosition, to: CardPosition): Board<Card | null> {
    const result = structuredClone(board);
    result[from.row][from.column] = board[to.row][to.column];
    result[to.row][to.column] = board[from.row][from.column];

    return result;
}
