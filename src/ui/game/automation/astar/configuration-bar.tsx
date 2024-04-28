
import { buildIntegerRangeValidator, useValidatedNumberInput } from "../../configuration/validated-input";
import { Configuration } from "./configuration";
import './configuration-bar.css';


export function ConfigurationBar({
    onConfigurationSubmission,
}: {
    onConfigurationSubmission(submission: Configuration): void,
}): JSX.Element {
    const [configElement, config] = useAStarConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <div className="configuration-bar">
        {configElement}
        <button disabled={config === null} onClick={handleSubmission}>Apply</button>
    </div>;
}

function useAStarConfiguration(): [JSX.Element, Configuration | null] {
    const [iterationsElement, iterations] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 1_000_000 }),
        hint: "max iterations",
        defaultValue: 10_000,
        valueRange: {
            min: 1,
            max: 1_000_000,
        }
    });

    const configElement = <div className="option-group flex-row">
        <label>A* parameters</label>

        <div className="option flex-row">
            <label>Iterations</label>
            {iterationsElement}
        </div>
    </div>;

    const config: Configuration | null = iterations !== null
        ? { iterations }
        : null;

    return [configElement, config];
}
