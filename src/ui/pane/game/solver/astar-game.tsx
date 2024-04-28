import React from "react";
import { Board, getCellCount } from "../../../../board";
import { Card } from "../../../../cards";
import { GameRules, Move } from "../../../../game";
import { findCorrectlyPlacedCards, findGaps, getStuckGaps, solitaireGapsRules } from "../../../../logic/rules";
import { AStar } from "../../../../logic/solver/astar";
import { State } from "../../../../logic/solver/state";
import { Configuration } from "../../../game/automation/astar/configuration";
import { ConfigurationBar } from "../../../game/automation/astar/configuration-bar";
import { PlaybackBoard } from "../../../game/board/playback";
import { GamePlaybackControls, PlaybackState, getBoardAtMove, getHighlightedMove } from "../../../game/integration/playback-game";
import { Pane } from "../common";
import { BoardNode } from "./node";

export interface AStarPaneState {
    initialBoard: Board<Card | null>,
    moves?: Array<Move>,
    playbackState: PlaybackState,
}

export function AStarGamePane({
    rules,
    state,
    onStateChange,
}: {
    rules: GameRules,
    state: AStarPaneState,
    onStateChange: (state: AStarPaneState) => void,
}): JSX.Element {
    const [loading, setLoading] = React.useState(false);

    if (!state.initialBoard) throw new Error("expected board to be defined");

    async function handleConfigurationSubmission(configuration: Configuration) {
        setLoading(true);

        // Yields to the event loop and causes React to re-render the component.
        // This is a hack. Ideally, we'd spawn a web worker for the calculation and use useEffect to
        // handle the communication with it.
        await new Promise(resolve => setTimeout(resolve, 1));

        const heuristicFn = (state: State<Board<Card | null>, Move>) => {
            const board: Board<Card | null> = state.get();
            const functions = [
                getCellCount(board) - findCorrectlyPlacedCards(board).length,
                getStuckGaps(board).length,
                findGaps(board, 2).length,
            ]
            const weights = [3, 5, 1];
            return functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        }

        const astar = new AStar.AStarSearch(
            new BoardNode(rules, state.initialBoard),
            configuration.maxOpenSetSize,
            heuristicFn);
        const path = astar.findPath();

        console.log("path:", path);

        onStateChange(Object.assign(state, {
            moves: path?.map(it => it.action),
        }));
    }

    function handlePlaybackStateChange(playbackState: PlaybackState) {
        onStateChange(Object.assign(state, {
            playbackState,
        }));
    }

    const playbackBoard = React.useMemo(() => {
        const board = deriveBoard(state);
        const highlightedMove = getHighlightedMove(state.moves ?? [], state.playbackState);

        return { board, highlightedMove };
    }, [state.moves, state.playbackState]);

    return <>
        <ConfigurationBar onConfigurationSubmission={handleConfigurationSubmission} />
        <div className="playback">
            <PlaybackBoard board={playbackBoard.board} highlightedMove={playbackBoard.highlightedMove} />
            <GamePlaybackControls
                moves={state.moves ?? []}
                playbackState={state.playbackState}
                onPlaybackStateChange={handlePlaybackStateChange} />
        </div>
    </>;
}

function buildDefaultState(initialBoard: Board<Card | null>): AStarPaneState {
    return {
        initialBoard,
        playbackState: { moveIndex: 'initial' },
    }
}

function deriveBoard(state: AStarPaneState): Board<Card | null> {
    return getBoardAtMove(state.initialBoard, state.moves ?? [], state.playbackState);
}

export const astarGamePane: Pane<AStarPaneState> = {
    deriveBoard,
    buildDefaultState,
    render: AStarGamePane,
}
