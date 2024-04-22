import React from "react";
import { Board, withCardsSwapped } from "../../../board";
import { Card } from "../../../cards";
import { Configuration } from "../../../configuration";
import { Move } from "../../../game";
import { generateShuffledBoard } from "../../../logic/generation";
import { solitaireGapsRules } from "../../../logic/rules";
import { Game } from "./game";
import { getBoardOfSeed } from "../setup/seed";

function generateInitialBoard(configuration: Configuration): Board<Card | null> {
    switch (configuration.boardGeneration.method) {
        case 'random':
            return generateShuffledBoard(configuration.boardGeneration.dimensions);
        case 'seed':
            const board = getBoardOfSeed(configuration.boardGeneration.seed);
            if (board === null)
                throw new Error("specified seed is invalid");

            return board;
    }
}

export function GameDemo({
    configuration
}: {
    configuration: Configuration,
}) {
    const [board, setBoard] = React.useState<Board<Card | null>>(() => generateInitialBoard(configuration));

    // Informs this component that the user would like to perform a swap (i.e., they selected a second card).
    // Note that while the UI code ensures that a card is not swapped with itself, it does not ensure consistency
    // with 'requestSwapCandidates'. That is, this function is also called for cards that have not previously
    // been reported as candidates.
    function handleMove(move: Move): void {
        const boardWithMoveApplied = withCardsSwapped(board, move.from, move.to);
        setBoard(boardWithMoveApplied);
    }

    return <Game board={board} rules={solitaireGapsRules} onMove={handleMove} />
}
