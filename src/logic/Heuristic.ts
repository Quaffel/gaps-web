import { BoardState } from "./BoardState";

export namespace Heuristics {
    // A gap is considered stuck if it the previous card is the highest rank of the game
    export function countStuckGaps(board: BoardState): number {
        return board.getStuckGaps().length;
    }
}