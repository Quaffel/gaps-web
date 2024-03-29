import React from "react";
import { Card } from "../cards";
import { Swap } from "./game";
import { DisplayState, PlaybackBoard, PlaybackControlsBar } from "./playback";
import { Board } from "./board/board";

import './game-playback.css';

export function GamePlayback({
    initialBoard,
    swaps,
}: {
    initialBoard: Board<Card | null>,
    swaps: Array<Swap>,
}): JSX.Element {
    const [currentDisplayState, setCurrentlyDisplayedState] = React.useState<DisplayState>('initial');

    function showFirst() {
        setCurrentlyDisplayedState('initial');
    }

    function showLast() {
        setCurrentlyDisplayedState('final');
    }

    function showNext() {
        if (currentDisplayState === 'final') throw new Error("unreachable (button should not be active)");

        let nextDisplayState;
        if (currentDisplayState === 'initial')
            nextDisplayState = 0;
        else if (currentDisplayState === swaps.length - 1)
            nextDisplayState = 'final' as const;
        else
            nextDisplayState = currentDisplayState + 1;

        setCurrentlyDisplayedState(nextDisplayState);
    }

    function showPrevious() {
        if (currentDisplayState === 'initial') throw new Error("unreachable (button should not be active)");

        let previousDisplayState;
        if (currentDisplayState === 'final')
            previousDisplayState = swaps.length - 1;
        else if (currentDisplayState === 0)
            previousDisplayState = 'initial' as const;
        else
            previousDisplayState = currentDisplayState - 1;

        setCurrentlyDisplayedState(previousDisplayState);
    }

    return <div className="playback">
        <PlaybackBoard initialBoard={initialBoard} swaps={swaps} displayedState={currentDisplayState} />
        <PlaybackControlsBar controls={[
            {
                action: 'skip-back',
                enabled: currentDisplayState !== 'initial',
                onAction: () => showFirst(),
            }, {
                action: 'rewind',
                enabled: currentDisplayState !== 'initial',
                onAction: () => showPrevious(),
            }, {
                action: 'play',
                enabled: false,
            }, {
                action: 'fast-forward',
                enabled: currentDisplayState !== 'final',
                onAction: () => showNext(),
            }, {
                action: 'skip-forward',
                enabled: currentDisplayState !== 'final',
                onAction: () => showLast()
            }
        ]} />
    </div>;
}