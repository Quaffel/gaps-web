export function ControlsBar({
    disabled,
}: {
    disabled: boolean,
}): JSX.Element {
    return <div className="form-group flex-row gap-2">
        <button disabled={disabled}>Reset</button>
        <button disabled={disabled}>Shuffle</button>
        <button disabled={disabled}>A*</button>
        <button disabled={disabled}>MCTS</button>
        <button disabled={disabled}>Console log children</button>

        <div className="form-group flex-row">
            <label>Show highlight</label>
            <input
                type="checkbox"
                checked={false}
                onChange={undefined}
            />
        </div>

        <div className="form-group">
            <label>Algorithm complexity</label>
            <div className="small-text">(A*: max closed nodes, MCTS: max iterations)</div>
            <input
                placeholder="How deep the search should go"
                type="text"
                pattern="[0-9]*"
                value={/*maxDepth*/ undefined}
                onChange={undefined}
            />
        </div>
    </div>;
}
