import { Configuration } from "../../configuration";
import { ConfigurationMenu } from "../game/setup/configuration-menu";


export function ConfigurationPane({
    onConfigurationCompletion,
}: {
    onConfigurationCompletion(configuration: Configuration): void,
}): JSX.Element {
    function handleConfigurationSubmission(configuration: Configuration) {
        onConfigurationCompletion(configuration);
    }

    return <ConfigurationMenu onConfigurationSubmission={handleConfigurationSubmission} />
}
