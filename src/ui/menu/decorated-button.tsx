import { Resource, getResourcePath } from '../resources';

import './decorated-button.css';

export function DecoratedButton({
    label, icon, disabled, onSelect
}: {
    label: string,
    icon: Resource,
    disabled?: boolean,
    onSelect?: () => void,
}): JSX.Element {
    return <button className='decorated-button' type='button' disabled={disabled} onClick={() => onSelect?.()}>
        {/* Buttons are replaced elements, meaning that CSS layout rules do not apply.  
            As buttons center their contents by default, we instead use a wrapping 'div' element of
            equal size and do the layouting within the inner 'div' element. */}
        <div>{label}</div>

        <img src={getResourcePath(icon)} />
    </button>
}
