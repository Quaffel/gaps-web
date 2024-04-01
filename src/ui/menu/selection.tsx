import React from "react";
import { Resource } from "../resources";

interface Option {
    label: string,
    icon: Resource,
    content: () => JSX.Element,
}

interface Context {
    selectedOptionIdx: number,
    options: Array<Option>,
    selectOption(optionIdx: number): void
}

export const SelectionContext = React.createContext<Context>({} as any);

export function WithSelector({
    options,
    children,
}: React.PropsWithChildren<{
    options: Array<Option>
}>) {
    if (options.length === 0) throw new Error("options array must not be empty");

    const [selectedOptionIdx, setSelectedOptionIdx] = React.useState<number>(0);

    function selectOption(optionIdx: number): void {
        if (optionIdx < 0 || optionIdx >= options.length) throw new Error("option index is out ouf bounds");

        setSelectedOptionIdx(optionIdx);
    }

    return <SelectionContext.Provider value={{
        options,
        selectedOptionIdx,
        selectOption,
    }}>{children}</SelectionContext.Provider>
}

export function SelectionDisplay() {
    const selectionContext = React.useContext(SelectionContext);

    const displayedElement = React.useMemo(() => {
        const selectedItem = selectionContext.options[selectionContext.selectedOptionIdx];
        return selectedItem.content();
    }, [selectionContext.selectedOptionIdx]);

    return displayedElement;
}
