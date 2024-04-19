import React from "react";

import './validated-input.css';

type Validator<T> = (input: T) => boolean;

export function buildIntegerRangeValidator(valueRange: { min: number, max: number }): Validator<number> {
    return input => {
        return input >= valueRange.min && input <= valueRange.max;
    }
}

/*export function ValidatedTextInput({
    validator,
    hint,
    placeholder,
}: {
    validator: Validator,
    hint?: string,
    placeholder?: string,
}): [JSX.Element, string | null] {
    const [content, setContent] = React.useState("");
    const element = React.useRef<HTMLInputElement | null>(null)

    const valid = React.useMemo(() => {
        return validator(content);
    }, [validator, content]);

    function handleContentChange(updatedContent: string) {
        setContent(updatedContent);
        element.current.setValid
    }

    const inputElement = <input
        placeholder={placeholder}
        type="text"
        ref={element}
        onInput={e => handleContentChange(e.currentTarget.textContent!)}
    />

    return [inputElement, valid ? content : null];
}*/


export function useValidatedNumberInput({
    validator,
    valueRange,
    hint,
    placeholder,
}: {
    validator: Validator<number>,
    valueRange: { min: number, max: number }
    hint?: string,
    placeholder?: string,
}): [JSX.Element, number | null] {
    const [content, setContent] = React.useState<{
        text: string,
        validValueOrNull: number | null,
    }>({ text: "", validValueOrNull: null });

    const element = React.useRef<HTMLInputElement | null>(null)

    function handleContentChange(updatedContent: string) {
        const numericValue = parseInt(updatedContent, 10);
        const valid = !isNaN(numericValue)
            && numericValue.toString(10).length === updatedContent.length
            && validator(numericValue);

        setContent({
            text: updatedContent,
            validValueOrNull: valid ? numericValue : null,
        });

        element.current?.setCustomValidity(valid ? "" : (hint ?? "invalid"));
    }

    const inputElement = <input
        placeholder={placeholder}
        type="number"
        ref={element}
        min={valueRange.min}
        max={valueRange.max}
        onInput={e => handleContentChange(e.currentTarget.value!)}
    />

    return [inputElement, content.validValueOrNull];
}
