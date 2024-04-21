import React from "react";
import { SelectionContext } from "./selection";
import { DecoratedButton } from "../common/decorated-button";

import './selection-bar.css';

export function SelectionBar() {
    const selectionContext = React.useContext(SelectionContext);

    function selectOption(optionIdx: number): void {
        if (selectionContext.selectedOptionIdx === optionIdx)
            throw new Error("unreachable (button should not be active)");

        console.log(`selected option @ idx ${optionIdx}`)
        selectionContext.selectOption(optionIdx);
    }

    return <nav>
        {selectionContext.options.map((option, optionIdx) => <DecoratedButton
            label={option.label}
            icon={option.icon}
            disabled={optionIdx === selectionContext.selectedOptionIdx}
            onSelect={() => selectOption(optionIdx)} />)}
    </nav>;
}
