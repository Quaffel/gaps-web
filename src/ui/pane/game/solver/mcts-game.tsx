import React from "react";
import { Board } from "../../../../board";
import { Card } from "../../../../cards";
import { GameRules, Move } from "../../../../game";
import { MCTS } from "../../../../logic/solver/mcts";
import { Path } from "../../../../logic/solver/state";
import { PlaybackBoard } from "../../../game/board/playback";
import { GamePlaybackControls, PlaybackState, getBoardAtMove, getHighlightedMove } from "../../../game/integration/playback-game";
import { Pane } from "../common";
import { BoardNode } from "./node";
import { Configuration } from "../../../game/automation/mcts/configuration";
import { ConfigurationBar } from "../../../game/automation/mcts/configuration-bar";

export interface MctsPaneState {
    initialBoard: Board<Card | null>,
    moves?: Array<Move>,
    playbackState: PlaybackState,
}

export function MctsGamePane({
    rules,
    state,
    onStateChange,
}: {
    rules: GameRules,
    state: MctsPaneState,
    onStateChange: (state: MctsPaneState) => void,
}): JSX.Element {
    const [loading, setLoading] = React.useState(false);

    if (!state.initialBoard) throw new Error("expected board to be defined");

    async function handleConfigurationSubmission(configuration: Configuration) {
        setLoading(true);

        // Yields to the event loop and causes React to re-render the component.
        // This is a hack. Ideally, we'd spawn a web worker for the calculation and use useEffect to
        // handle the communication with it.
        await new Promise(resolve => setTimeout(resolve, 1));

        const mcts = new MCTS.MCTSSearch<Board<Card | null>, Move>(state => rules.getScore(state.get()));

        const path: Path<Board<Card | null>, Move> = [];
        let board = state.initialBoard;
        for (let iteration = 0; iteration < configuration.maxIterations; iteration++) {
            const { done, element } = mcts.findNextMove(
                new BoardNode(rules, board),
                configuration.maxDepth);

            board = element.state;
            path.push(element);

            if (done) break;
        }

        console.log("path", path);

        onStateChange({
            initialBoard: state.initialBoard,
            playbackState: state.playbackState,
            moves: path?.map(it => it.action)
        });
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

function buildDefaultState(initialBoard: Board<Card | null>): MctsPaneState {
    return {
        initialBoard,
        playbackState: { moveIndex: 'initial' },
    }
}

function deriveBoard(state: MctsPaneState): Board<Card | null> {
    return getBoardAtMove(state.initialBoard, state.moves ?? [], state.playbackState);
}

export const mctsGamePane: Pane<MctsPaneState> = {
    deriveBoard,
    buildDefaultState,
    render: MctsGamePane,
}
