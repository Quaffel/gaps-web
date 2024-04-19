import React from "react";
import { Configuration } from "../../configuration";
import { buildIntegerRangeValidator, useValidatedNumberInput } from "./validated-input";
import { LabeledRuler } from "./labeled-ruler";

import './configuration-menu.css';


export function ConfigurationMenu({
    onConfigurationSubmission,
}: {
    onConfigurationSubmission(configuration: Configuration): void,
}) {
    const [configElement, config] = useConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <div className="configuration-menu">
        {configElement}

        <button disabled={config === null} onClick={() => handleSubmission()}>Submit</button>
    </div>
}

export function useConfiguration(): [JSX.Element, Configuration | null] {
    const [rowsElement, rows] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 4 }),
        valueRange: { min: 1, max: 4 },
        hint: "from 1 to 4",
        placeholder: "from 1 to 4"
    });

    const [columnsElement, columns] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 13 }),
        valueRange: { min: 1, max: 13 },
        hint: "from 1 to 13",
        placeholder: "from 1 to 13"
    });

    const menuElement = <>
        <div className="option-group">
            <div className="option">
                <label>Rows</label>
                {rowsElement}
            </div>

            <div className="option">
                <label>Columns</label>
                {columnsElement}
            </div>

            <LabeledRuler label="or" />

            <div className="option">
                <label htmlFor="seed">Seed</label>
                <input placeholder={"3.10 0.0 0.1 ..."} type="text" />
            </div>
        </div>
    </>;

    return [menuElement, rows !== null && columns !== null ? {
        boardDimensions: {
            rows,
            columns,
        },
        seed: null,
    } : null];
}


