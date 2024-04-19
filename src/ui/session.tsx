import React from "react";
import { Board } from "../board";
import { Card } from "../cards";
import { Configuration } from "../configuration";
import { GameDemo } from "../demo/game";
import { ConfigurationMenu } from "./setup/configuration-menu";

import './session.css';

type State = {
    name: 'configuration',
} | {
    name: 'in-game',
    configuration: Configuration,
}

function deriveBoardState(seed: string | null): Board<Card | null> {
    return [];
}

export function GameSession(): JSX.Element {
    const [currentState, setCurrentState] = React.useState<State>({
        name: 'configuration',
    });

    function launchGame(configuration: Configuration) {
        setCurrentState({
            name: 'in-game',
            configuration,
        });
    }

    let element: JSX.Element;
    if (currentState.name === 'configuration') {
        element = <ConfigurationMenu onConfigurationSubmission={launchGame} />;
    } else if (currentState.name === 'in-game') {
        element = <GameDemo />
    } else {
        throw new Error("unreachable")
    }

    return <div className="session">
        {element}
    </div>
}
