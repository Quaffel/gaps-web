import { Configuration } from "../configuration/setup/configuration";
import { ConfigurationMenu } from "../configuration/setup/configuration-menu";

import './setup.css';

export function ConfigurationPane({
    onConfigurationCompletion,
}: {
    onConfigurationCompletion(configuration: Configuration): void,
}): JSX.Element {
    function handleConfigurationSubmission(configuration: Configuration) {
        onConfigurationCompletion(configuration);
    }

    return <div className="configuration-pane">
        <ConfigurationMenu onConfigurationSubmission={handleConfigurationSubmission} />
    </div>;
}
