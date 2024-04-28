import { Board } from "../../../board";
import { Card } from "../../../cards";
import { Move } from "../../../game";
import { MoveIndex, PlaybackControlsBar } from "../board/playback";

import './playback-game.css';

export interface PlaybackState {
    moveIndex: MoveIndex,
}

export function getBoardAtMove(
    initialBoard: Board<Card | null>,
    swaps: Array<Move>,
    playbackState: PlaybackState,
): Board<Card | null> {
    const moveIndex = playbackState.moveIndex;

    const board = structuredClone(initialBoard);
    if (moveIndex === 'initial') return board;

    function performSwap(swapIdx: number) {
        const swap = swaps[swapIdx];

        const fromCard = board[swap.from.row][swap.from.column];
        const toCard = board[swap.to.row][swap.to.column];

        board[swap.from.row][swap.from.column] = toCard;
        board[swap.to.row][swap.to.column] = fromCard;
    }

    const displayedSwapIdx = typeof moveIndex === 'number'
        ? moveIndex
        : (() => {
            const _assertStateIsFinal: 'final' = moveIndex;
            return swaps.length;
        })();

    for (let swapIdx = 0; swapIdx < displayedSwapIdx; swapIdx++) {
        performSwap(swapIdx);
    }

    return board;
}

export function getHighlightedMove(moves: Array<Move>, playbackState: PlaybackState): Move | null {
    const moveIndex = playbackState.moveIndex;

    if (moveIndex === 'initial' || moveIndex === 'final') return null;
    return moves[moveIndex];
}

export function GamePlaybackControls({
    moves,
    playbackState,
    onPlaybackStateChange,
}: {
    moves: Array<Move>,
    playbackState: PlaybackState,
    onPlaybackStateChange(playbackState: PlaybackState): void,
}): JSX.Element {
    const moveIndex = playbackState.moveIndex;
    if (typeof moveIndex === 'number' && (moveIndex < 0 || moveIndex >= moves.length))
        throw new Error("displayed swap index is out of bounds");

    const movesAvailable = moves.length !== 0;

    function setMoveIndex(moveIndex: MoveIndex) {
        if (moveIndex === playbackState.moveIndex) return;

        onPlaybackStateChange({
            moveIndex,
        });
    }

    function showFirst() {
        if (!movesAvailable || moveIndex === 'initial') throw new Error("unreachable (button should not be active)");
        setMoveIndex('initial');
    }

    function showLast() {
        if (!movesAvailable || moveIndex === 'final') throw new Error("unreachable (button should not be active)");
        setMoveIndex('final');
    }

    function showNext() {
        if (!movesAvailable || moveIndex === 'final') throw new Error("unreachable (button should not be active)");

        let nextDisplayState;
        if (moveIndex === 'initial')
            nextDisplayState = 0;
        else if (moveIndex === moves.length - 1)
            nextDisplayState = 'final' as const;
        else
            nextDisplayState = moveIndex + 1;

        setMoveIndex(nextDisplayState);
    }

    function showPrevious() {
        if (!movesAvailable || moveIndex === 'initial') throw new Error("unreachable (button should not be active)");

        let previousDisplayState;
        if (moveIndex === 'final')
            previousDisplayState = moves.length - 1;
        else if (moveIndex === 0)
            previousDisplayState = 'initial' as const;
        else
            previousDisplayState = moveIndex - 1;

        setMoveIndex(previousDisplayState);
    }

    return <PlaybackControlsBar controls={[
        {
            action: 'skip-back',
            enabled: movesAvailable && moveIndex !== 'initial',
            onAction: () => showFirst(),
        }, {
            action: 'rewind',
            enabled: movesAvailable && moveIndex !== 'initial',
            onAction: () => showPrevious(),
        }, {
            action: 'play',
            enabled: false,
        }, {
            action: 'fast-forward',
            enabled: movesAvailable && moveIndex !== 'final',
            onAction: () => showNext(),
        }, {
            action: 'skip-forward',
            enabled: movesAvailable && moveIndex !== 'final',
            onAction: () => showLast()
        }
    ]} />;
}
