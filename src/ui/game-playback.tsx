import React from "react";
import { Card } from "../cards";
import { Swap } from "./game";
import { PlaybackBoard, PlaybackControlsBar } from "./playback";
import { Board } from "./board/board";

import './game-playback.css';

export function GamePlayback({
    initialBoard,
    swaps,
}: {
    initialBoard: Board<Card | null>,
    swaps: Array<Swap>,
}): JSX.Element {
    const [currentSwapIdx, setCurrentSwapIdx] = React.useState<number | null>(null);


    function showFirst() {
        setCurrentSwapIdx(null);
    }

    function showLast() {
        setCurrentSwapIdx(swaps.length - 1);
    }

    function showNext() {
        const nextSwapIdx = currentSwapIdx !== null ? currentSwapIdx + 1 : 0;
        setCurrentSwapIdx(nextSwapIdx);
    }

    function showPrevious() {
        const previousSwapIdx = currentSwapIdx !== null ? currentSwapIdx - 1 : null;
        setCurrentSwapIdx(previousSwapIdx);
    }

    return <div className="playback">
        <PlaybackBoard initialBoard={initialBoard} swaps={swaps} displayedSwapIdx={currentSwapIdx} />
        <PlaybackControlsBar controls={[
            {
                action: 'skip-back',
                enabled: currentSwapIdx !== null,
                onAction: () => showFirst(),
            }, {
                action: 'rewind',
                enabled: currentSwapIdx !== null,
                onAction: () => showPrevious(),
            }, {
                action: 'play',
                enabled: false,
            }, {
                action: 'fast-forward',
                enabled: currentSwapIdx !== swaps.length - 1,
                onAction: () => showNext(),
            }, {
                action: 'skip-forward',
                enabled: currentSwapIdx !== swaps.length - 1,
                onAction: () => showLast()
            }
        ]} />
    </div>;
}