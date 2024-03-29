import React from "react";
import { Card, RankValues, SuitValues } from "../cards";
import { Board, Highlight, HighlightedBoard } from "./board/board";
import { CardPosition, Game, Swap } from "./game";
import { ComponentType } from "../util/types";

import './playback.css';

export function PlaybackBoard({
    initialBoard,
    swaps,
    displayedSwapIdx
}: {
    initialBoard: Board<Card | null>,
    swaps: Array<Swap>,
    displayedSwapIdx: number | null
}) {
    if (displayedSwapIdx !== null && displayedSwapIdx >= swaps.length)
        throw new Error("displayed swap index is out of bounds");

    function getBoardAtSwap(
        initialBoard: Board<Card | null>,
        swaps: Array<Swap>,
        displayedSwapIdx: number | null
    ): Board<Card | null> {
        const board = structuredClone(initialBoard);

        function performSwap(swapIdx: number) {
            const swap = swaps[swapIdx];

            const fromCard = board[swap.from.row][swap.from.column];
            const toCard = board[swap.to.row][swap.to.column];

            board[swap.from.row][swap.from.column] = toCard;
            board[swap.to.row][swap.to.column] = fromCard;
        }

        for (let swapIdx = 0; swapIdx < (displayedSwapIdx ?? 0); swapIdx++) {
            performSwap(swapIdx);
        }

        return board;
    }

    function getHighlightsAtSwap(
        swaps: Array<Swap>,
        displayedSwapIdx: number | null
    ): Array<Highlight> {
        if (displayedSwapIdx === null)
            return [];

        const swap = swaps[displayedSwapIdx];

        return [{
            spot: swap.from,
            highlight: 'selection',
        }, {
            spot: swap.to,
            highlight: 'candidate',
        }];
    }

    const board = React.useMemo(() => {
        return getBoardAtSwap(initialBoard, swaps, displayedSwapIdx);
    }, [initialBoard, swaps, displayedSwapIdx]);

    const highlights = React.useMemo(() => {
        return getHighlightsAtSwap(swaps, displayedSwapIdx);
    }, [swaps, displayedSwapIdx]);

    return <HighlightedBoard
        state={board}
        highlights={highlights}
        // ignore card selections during playback
        onCardSelect={undefined} />
}

const ActionValues = ['play', 'pause', 'fast-forward', 'rewind', 'skip-forward', 'skip-back'] as const;
type Action = ComponentType<typeof ActionValues>;

export interface PlaybackControl {
    action: Action
    enabled: boolean
    onAction?: () => void
}

function getImagePathForAction(
    icon: Action
): string {
    return `./res/icons/${icon}.svg`
}

export function PlaybackControlsBar({
    controls
}: {
    controls: Array<PlaybackControl>
}) {

    return <div className="playback-controls-bar">
        {controls.map(it => {
            return <button disabled={!it.enabled} onClick={() => it.onAction?.()}>
                <img src={getImagePathForAction(it.action)} />
            </button>;
        })}
    </div>
}
