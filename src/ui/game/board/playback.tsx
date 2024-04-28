import React from "react";
import { Board } from "../../../board";
import { Card } from "../../../cards";
import { Move } from "../../../game";
import { ComponentType } from "../../../util/types";
import { getResourcePath } from "../../resources";
import { Highlight, HighlightedBoard } from "./board";

import './playback.css';

export type MoveIndex = 'initial' | 'final' | number;

export function PlaybackBoard({
    board,
    highlightedMove,
}: {
    board: Board<Card | null>,
    highlightedMove: Move | null,
}) {
    const highlights = React.useMemo<Array<Highlight>>(() => {
        if (highlightedMove === null) return [];

        return [{
            spot: highlightedMove.from,
            highlight: 'selection',
        }, {
            spot: highlightedMove.to,
            highlight: 'swap-candidate',
        }];
    }, [highlightedMove]);

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
        {controls.map(it => <button
            disabled={!it.enabled}
            onClick={() => it.onAction?.()}
            key={it.action}>
            <img src={getActionIcon(it.action)} alt={it.action} />
        </button>)}
    </div>;
}
