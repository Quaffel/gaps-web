import React from "react";
import { Card } from "../cards";
import { Board } from "../board";
import { ComponentType } from "../util/types";
import { Highlight, HighlightedBoard } from "./board/board";
import { Swap } from "./game";
import { getResourcePath } from "./resources";

import './playback.css';

export type DisplayState = 'initial' | 'final' | number;

export function PlaybackBoard({
    initialBoard,
    swaps,
    displayedState
}: {
    initialBoard: Board<Card | null>,
    swaps: Array<Swap>,
    displayedState: DisplayState
}) {
    if (typeof displayedState === 'number' && (displayedState < 0 || displayedState >= swaps.length))
        throw new Error("displayed swap index is out of bounds");

    function getBoardAtSwap(
        initialBoard: Board<Card | null>,
        swaps: Array<Swap>,
        displayedState: DisplayState,
    ): Board<Card | null> {
        const board = structuredClone(initialBoard);
        if (displayedState === 'initial') return board;

        function performSwap(swapIdx: number) {
            const swap = swaps[swapIdx];

            const fromCard = board[swap.from.row][swap.from.column];
            const toCard = board[swap.to.row][swap.to.column];

            board[swap.from.row][swap.from.column] = toCard;
            board[swap.to.row][swap.to.column] = fromCard;
        }

        const displayedSwapIdx = typeof displayedState === 'number'
            ? displayedState
            : (() => {
                const _assertStateIsFinal: 'final' = displayedState;
                return swaps.length;
            })();

        for (let swapIdx = 0; swapIdx < displayedSwapIdx; swapIdx++) {
            performSwap(swapIdx);
        }

        return board;
    }

    function getHighlightsAtSwap(
        swaps: Array<Swap>,
        displayedState: DisplayState,
    ): Array<Highlight> {
        if (displayedState === 'initial' || displayedState === 'final')
            return [];

        const swap = swaps[displayedState];

        return [{
            spot: swap.from,
            highlight: 'selection',
        }, {
            spot: swap.to,
            highlight: 'candidate',
        }];
    }

    const board = React.useMemo(() => {
        return getBoardAtSwap(initialBoard, swaps, displayedState);
    }, [initialBoard, swaps, displayedState]);

    const highlights = React.useMemo(() => {
        return getHighlightsAtSwap(swaps, displayedState);
    }, [swaps, displayedState]);

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

export function PlaybackControlsBar({
    controls
}: {
    controls: Array<PlaybackControl>
}) {
    function getActionIcon(action: Action): string {
        return getResourcePath(`icon-feather/${action}`);
    }

    return <div className="playback-controls-bar">
        {controls.map(it => {
            return <button disabled={!it.enabled} onClick={() => it.onAction?.()}>
                <img src={getActionIcon(it.action)} alt={it.action} />
            </button>;
        })}
    </div>
}
